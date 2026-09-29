import { readFile, readdir, mkdir, writeFile, access } from 'node:fs/promises';
import { join, basename } from 'node:path';

const ROOT = '_growth/dev';
const PENDING = join(ROOT, 'pending');
const PUBLISHED = join(ROOT, 'published');
const API = 'https://dev.to/api/articles';
const ACCEPT = 'application/vnd.forem.api-v1+json';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function validatePost(post, filename) {
  const id = basename(filename, '.json');
  assert(/^[a-z0-9][a-z0-9-]{7,79}$/.test(id), `Invalid post id: ${id}`);
  assert(post.id === id, `Post id does not match filename: ${id}`);
  assert(typeof post.title === 'string' && post.title.trim().length >= 20, `Missing useful title: ${id}`);
  assert(typeof post.body_markdown === 'string' && post.body_markdown.length >= 800, `Article too short: ${id}`);
  assert(Array.isArray(post.sources) && post.sources.length > 0, `Missing sources: ${id}`);
  for (const source of post.sources) {
    assert(/^https:\/\//.test(source), `Invalid source URL: ${id}`);
    assert(post.body_markdown.includes(source), `Source URL absent from article: ${source}`);
  }
  const links = post.body_markdown.match(/https:\/\/aquamesh\.ai\/[\w\-./?=#%]*/g) || [];
  assert(links.length >= 1, `Missing AquaMesh link: ${id}`);
  assert(links.length <= 2, `Excessive AquaMesh links: ${id}`);
  assert(!post.canonical_url || /^https:\/\/aquamesh\.ai\//.test(post.canonical_url), `Invalid canonical URL: ${id}`);
  assert(!post.tags || (Array.isArray(post.tags) && post.tags.length <= 4 && post.tags.every(tag => /^[a-z0-9]+$/.test(tag))), `Invalid tags: ${id}`);
  return { id, links };
}

async function checkLive(url) {
  const response = await fetch(url, { method: 'GET', redirect: 'follow' });
  assert(response.ok && new URL(response.url).hostname === 'aquamesh.ai', `AquaMesh link is not live: ${url}`);
}

async function api(path, key, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { Accept: ACCEPT, 'Content-Type': 'application/json', 'api-key': key, ...init.headers },
  });
  const body = await response.json().catch(() => ({}));
  assert(response.ok, `DEV API ${response.status}: ${JSON.stringify(body).slice(0, 400)}`);
  return body;
}

async function hasMatchingArticle(title, key) {
  for (let page = 1; page <= 20; page++) {
    const articles = await api(`/me/published?per_page=100&page=${page}`, key);
    assert(Array.isArray(articles), 'Unexpected DEV published list');
    if (articles.some(article => article.title === title)) return true;
    if (articles.length < 100) return false;
  }
  throw new Error('Published article search exceeded 20 pages; stopped to prevent duplication');
}

export async function publishAll(key) {
  assert(key, 'DEVTO_API_KEY is missing');
  await mkdir(PENDING, { recursive: true });
  await mkdir(PUBLISHED, { recursive: true });
  const filenames = (await readdir(PENDING)).filter(file => file.endsWith('.json')).sort();
  for (const filename of filenames) {
    const marker = join(PUBLISHED, filename);
    try { await access(marker); console.log(`Already recorded: ${filename}`); continue; } catch { /* pending */ }
    const post = JSON.parse(await readFile(join(PENDING, filename), 'utf8'));
    const { id, links } = validatePost(post, filename);
    for (const link of [...new Set(links)]) await checkLive(link);
    if (post.canonical_url) await checkLive(post.canonical_url);
    if (await hasMatchingArticle(post.title, key)) throw new Error(`DEV article title already published; inspect before retrying: ${id}`);
    const article = await api('', key, {
      method: 'POST',
      body: JSON.stringify({ article: {
        title: post.title,
        body_markdown: post.body_markdown,
        published: true,
        tags: post.tags || [],
        ...(post.canonical_url ? { canonical_url: post.canonical_url } : {}),
      } }),
    });
    assert(typeof article.url === 'string' && article.url.startsWith('https://dev.to/'), `DEV returned no live URL for ${id}`);
    const live = await fetch(article.url);
    assert(live.ok, `DEV article cannot be verified live: ${article.url}`);
    await writeFile(marker, JSON.stringify({ id, title: post.title, url: article.url, published_at: new Date().toISOString(), sources: post.sources }, null, 2) + '\n');
    console.log(`Published ${id}: ${article.url}`);
  }
}

if (process.argv[1]?.endsWith('dev-publisher.mjs')) {
  publishAll(process.env.DEVTO_API_KEY).catch(error => { console.error(error.message); process.exitCode = 1; });
}
