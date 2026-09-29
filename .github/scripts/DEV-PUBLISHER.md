# AquaMesh DEV publisher

The AquaMesh SEO agent can add one JSON file per article under `_growth/dev/pending/`. A push to `main` triggers the publishing workflow. GitHub Pages does not need these files to render a site page.

Use a unique lowercase slug for both the filename and the `id` property:

```json
{
  "id": "2026-09-29-example-industrial-data",
  "title": "A specific technical title of at least 20 characters",
  "body_markdown": "An original, sourced technical article of at least 800 characters, with a natural relevant https://aquamesh.ai/ link and source links in the text.",
  "sources": ["https://example.org/actual-primary-source"],
  "tags": ["iot", "data"]
}
```

The article must be unique to the DEV engineering audience. Source URLs must be opened and checked by the agent, with dates and fact versus inference distinguished. Reserved editorial submissions and customer confidential material are excluded. Do not set `canonical_url` unless the same article was first published at that exact live AquaMesh URL and syndication rights permit it.

The workflow reads `DEVTO_API_KEY` from a GitHub Actions repository secret. It validates the article, checks AquaMesh links, searches DEV's published articles for an exact title duplicate, publishes, verifies the resulting URL, and records it under `_growth/dev/published/`. If a check fails, it stops. The agent should inspect the workflow result and live URL, then update the Content ledger.

Do not store the API key in the repository or chat. The account owner must authorize the DEV account and repository secret once. This setup does not change the AquaMesh landing page.
