/* A deliberately small Markdown subset: everything the blog posts use, nothing
   more. Keeping it dependency-free means `node scripts/build-blog.mjs` works on
   a clean checkout with no install step. */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');

/* inline: code -> links -> bold -> italic, with code spans protected first */
export function inline(src) {
  const code = [];
  let s = src.replace(/`([^`]+)`/g, (_, c) => {
    code.push('<code>' + esc(c) + '</code>');
    return '\u0000' + (code.length - 1) + '\u0000';
  });
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, alt, src2, t) => `<img src="${escAttr(src2)}" alt="${escAttr(alt)}"${t ? ` title="${escAttr(t)}"` : ''} loading="lazy" decoding="async" />`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
    const ext = /^https?:\/\//.test(href) && !href.includes('aquamesh.ai');
    return `<a href="${escAttr(href)}"${ext ? ' rel="noopener"' : ''}>${text}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  s = s.replace(/——/g, '—');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => code[+i]);
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function render(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const toc = [];
  let i = 0;

  const flushPara = (buf) => { if (buf.length) { out.push('<p>' + inline(buf.join(' ')) + '</p>'); buf.length = 0; } };
  const para = [];

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { flushPara(para); i++; continue; }

    /* fenced code */
    if (/^```/.test(line)) {
      flushPara(para);
      const lang = line.slice(3).trim();
      const body = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) body.push(lines[i++]);
      i++;
      out.push(`<pre${lang ? ` data-lang="${escAttr(lang)}"` : ''}><code>${esc(body.join('\n'))}</code></pre>`);
      continue;
    }

    /* heading */
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      flushPara(para);
      const level = h[1].length, text = h[2].trim(), id = slugify(text);
      if (level === 2) toc.push({ id, text });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++; continue;
    }

    /* horizontal rule */
    if (/^---+$/.test(line.trim())) { flushPara(para); out.push('<hr />'); i++; continue; }

    /* blockquote */
    if (/^>\s?/.test(line)) {
      flushPara(para);
      const body = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) body.push(lines[i++].replace(/^>\s?/, ''));
      out.push('<blockquote>' + render(body.join('\n')).html + '</blockquote>');
      continue;
    }

    /* table */
    if (/^\|/.test(line) && /^\|[\s:|-]+\|$/.test((lines[i + 1] || '').trim())) {
      flushPara(para);
      const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push('<div class="table-wrap"><table class="cs-table"><thead><tr>' +
        head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table></div>');
      continue;
    }

    /* lists */
    const ul = /^[-*]\s+(.*)$/, ol = /^\d+\.\s+(.*)$/;
    if (ul.test(line) || ol.test(line)) {
      flushPara(para);
      const ordered = ol.test(line);
      const re = ordered ? ol : ul;
      const items = [];
      while (i < lines.length && re.test(lines[i])) {
        let item = lines[i++].match(re)[1];
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) item += ' ' + lines[i++].trim();
        items.push(item);
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag} class="post-list">` + items.map(t => `<li>${inline(t)}</li>`).join('') + `</${tag}>`);
      continue;
    }

    para.push(line.trim());
    i++;
  }
  flushPara(para);
  return { html: out.join('\n'), toc };
}

export function plain(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
