# AlertZero Behind the Scenes · Elastic Security

A 27-slide [fslides](https://www.npmjs.com/package/fslides) deck on AlertZero, the agentic layer of Elastic Security: Watches, Workers, hand-offs, proposals, autonomy and a live demo. Every slide is an HTML file in `slides/`; speaker notes are in `notes.json`.

## Run it

```bash
npm install
npm run serve        # http://localhost:3007 with the full player
```

Press `N` in the player for speaker notes.

## Static site and PDF

```bash
npm run build        # static site in _site/, host anywhere (GitHub Pages, any web server)
npm run pdf          # alertzero-deck.pdf (on macOS you may need PUPPETEER_EXECUTABLE_PATH pointing at Google Chrome)
```
