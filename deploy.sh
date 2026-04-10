#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

cp -f \
  index.html \
  app.js \
  feed.xml \
  cover.jpg \
  cover-3000x3000.jpg \
  cover-1600x1600.jpg \
  cover-800x800.jpg \
  cover-300x300.jpg \
  konstantin_elmo.jpeg \
  README.md \
  mix-*.html \
  studio-mix-p1.html \
  favicon-32x32.png \
  favicon.png \
  apple-touch-icon.png \
  _headers \
  dist/

cp -R imgs dist/

npx wrangler@4.81.1 pages deploy dist --project-name waxhelsinki
