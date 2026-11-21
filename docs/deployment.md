# Deployment

`npm ci && npm run lint && npm test` builds and checks the static website. Serve or upload the resulting `dist/` directory. A typical static host must serve `index.html` automatically for directory routes. Use HTTPS in production for Clipboard API access.

GitHub Pages uses the GitHub Actions publishing source. Pushes to `main` build and test, upload the artifact and deploy it. Pull requests run lint and tests. On a fork, enable GitHub Actions and select GitHub Actions as the Pages source. Set `SITE_URL` in the build environment or update `site/config.mjs` for the canonical HTTPS URL, including the repo path if applicable.

Check the homepage, a deep lesson URL, an image-processing lab, the search index and sitemap after deployment. Configure analytics independently using the [analytics setup](analytics.md). The site has no required database or service credentials.
