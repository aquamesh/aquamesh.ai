# aquamesh.ai

The AquaMesh marketing site — one static page, no build step. Content and style
follow the September customer deck. The hero is the deck's monitor + AquaSpectra
render (`hero-product.jpg`, caption painted out) with a current, sanitized capture of
the live digital twin (`screen.jpg`, plant name anonymized, live findings excluded)
laid exactly over the monitor's screen in CSS.

The "Real plants. Real results." section uses anonymized figures from a real
customer audit — confirm the customer is comfortable before publishing.

```
index.html      the page
styles.css      design tokens + layout
main.js         hero streamline figure + sticky-nav border
assets/         product images, favicon, social card
CNAME           custom domain for GitHub Pages
```

Preview locally: `python3 -m http.server 8080` in this folder, then open http://localhost:8080.

## Publish on GitHub Pages at aquamesh.ai

1. Push this folder to a GitHub repository (for example `aquamesh/aquamesh.ai`).
2. **Settings → Pages → Build and deployment:** Deploy from a branch → `main` / `(root)`.
3. **Custom domain:** `aquamesh.ai` (the `CNAME` file here already sets it).
4. **DNS at your registrar** — web records only; leave the MX records alone so
   email to @aquamesh.ai keeps working:

   | Type  | Host | Value |
   |-------|------|-------|
   | A     | @    | 185.199.108.153 |
   | A     | @    | 185.199.109.153 |
   | A     | @    | 185.199.110.153 |
   | A     | @    | 185.199.111.153 |
   | AAAA  | @    | 2606:50c0:8000::153 |
   | AAAA  | @    | 2606:50c0:8001::153 |
   | AAAA  | @    | 2606:50c0:8002::153 |
   | AAAA  | @    | 2606:50c0:8003::153 |
   | CNAME | www  | `<your-org>.github.io` |

5. Once GitHub issues the certificate (minutes to an hour), tick **Enforce HTTPS**.
6. Recommended: verify `aquamesh.ai` under the organization's **Settings → Pages**
   so nobody else can claim the domain on GitHub.

## Editing

All copy is in `index.html`. Figures on the page come from the customer deck and
are framed as typical ranges or targets — keep that framing when numbers change.
Every "Book a demo" button opens an email to info@aquamesh.ai (subject: Demo request).
