# wax helsinki podcast

Live URLs:

- Site: `https://waxhelsinki.pages.dev`
- Feed: `https://waxhelsinki.pages.dev/feed.xml`

## Project structure

```text
mixes.json              Single source of truth for all mix data
index.html              Home page
styles.css              All CSS (shared by index + mix pages)
app.js                  Client logic (player, rendering, SPA routing)
_template/mix.html      Template for generated mix detail pages
scripts/
  build.py              Generates mix-*.html from template + mixes.json
  publish_episode.py    Adds new mix to mixes.json + feed.xml
mix-*.html              Generated (do not edit directly)
feed.xml                Podcast RSS feed
deploy.sh               Build + deploy to Cloudflare Pages
publish_episode.sh      Upload audio, update data, build, deploy
```

## Add a new episode (one command)

```bash
./publish_episode.sh <mp3-file> "<episode-title>" "<episode-description>"
```

Example:

```bash
./publish_episode.sh 3.mp3 "Mix 003" "Third wax helsinki mix."
```

What this does automatically:

1. Uploads the MP3 to R2 bucket `waxhelsinki-audio`
2. Adds a new entry to `mixes.json`
3. Adds a new episode item to `feed.xml`
4. Generates all `mix-*.html` pages from the template
5. Deploys updated site/feed to Cloudflare Pages

## Local dev server

```bash
python3 scripts/build.py && npx wrangler@4.83.0 pages dev
```

This serves the site at `http://localhost:8788`. Edits to `app.js`, `styles.css`, and `index.html` are live on refresh.

`mixes.json` is read at runtime by `app.js`, so homepage/runtime data updates show after refresh. Re-run `python3 scripts/build.py` after changing `mixes.json` or `_template/mix.html` to regenerate the static `mix-*.html` pages.

## Deploy (manual)

```bash
./deploy.sh
```

This runs `scripts/build.py` to regenerate mix pages, then deploys to Cloudflare Pages.

## Regenerate mix pages only

```bash
python3 scripts/build.py
```

Run this after editing `mixes.json` or `_template/mix.html`.

## Requirements

- Wrangler auth is already active (`npx wrangler@4.83.0 whoami`)
- R2 bucket exists and is public: `waxhelsinki-audio`
- `ffprobe`, `python3`, and `xmllint` installed
