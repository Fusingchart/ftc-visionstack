# Architecture

The site is a static, dependency-free Node 22 build with JavaScript modules and authored content records. This keeps deployment portable and pages crawlable. It avoids client-side routing and allows all instruction pages to render without JavaScript. Modern browser modules enable search, code copying, themes, feedback drafts and live labs. Native HTML labels and buttons provide the interaction primitives.

- `content/pages.mjs` is the route registry. Collections export stable relative paths and sections.
- `scripts/build.mjs` renders static HTML, metadata, navigation and a JSON search index. Search runs locally in the browser.
- `site/config.mjs` centralizes brand, team, URLs, SDK, season and analytics configuration.
- `site/models.mjs` provides pure simulator calculations. `site/tools.mjs` turns their outputs into plots, summaries and mask overlays.
- `ftc-examples/src` contains SDK 12.0 Java entry points. Limelight examples share a lifecycle and gating implementation. VisionPortal uses an independent example.
- `pipelines/color_blob.py` provides the firmware-side bench image pipeline used by the SnapScript example.

Project pages read Java source at build time and link the helper files. Project entries can be filtered by keywords in the title or description. Images selected in the HSV lab stay in browser memory.
