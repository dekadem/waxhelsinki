#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "-> Generating mix pages"
python3 scripts/build.py

echo "-> Preparing dist/"
rm -rf dist
mkdir -p dist

cp -f \
  index.html \
  app.js \
  styles.css \
  mixes.json \
  feed.xml \
  cover.jpg \
  cover-3000x3000.jpg \
  cover-1600x1600.jpg \
  cover-800x800.jpg \
  cover-300x300.jpg \
  konstantin_elmo.jpeg \
  favicon-32x32.png \
  favicon.png \
  apple-touch-icon.png \
  _headers \
  dist/

NULLGLOB_STATE="$(shopt -p nullglob || true)"
shopt -s nullglob
for mix_html in mix-*.html; do
  cp -f "$mix_html" dist/
done
eval "$NULLGLOB_STATE"

cp -R imgs dist/

echo "-> Deploying to Cloudflare Pages"
npx wrangler@4.81.1 pages deploy dist --project-name waxhelsinki
