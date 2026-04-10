#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage:"
  echo "  ./publish_episode.sh <mp3-file> \"<episode-title>\" \"<episode-description>\""
  echo ""
  echo "Example:"
  echo "  ./publish_episode.sh 3.mp3 \"Mix 003\" \"Third wax helsinki mix.\""
  exit 1
fi

MP3_FILE="$1"
TITLE="$2"
DESCRIPTION="$3"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if [ ! -f "$MP3_FILE" ]; then
  echo "File not found: $MP3_FILE"
  exit 1
fi

if ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffprobe is required but not installed."
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required but not installed."
  exit 1
fi

AUDIO_BUCKET="waxhelsinki-audio"
PAGES_PROJECT="waxhelsinki"

echo "-> Getting file metadata"
AUDIO_BASENAME="$(basename "$MP3_FILE")"
AUDIO_SIZE="$(stat -f "%z" "$MP3_FILE")"
AUDIO_DURATION_SECONDS="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$MP3_FILE")"
PUB_DATE="$(date -u '+%a, %d %b %Y %H:%M:%S GMT')"

if rg -q "${AUDIO_BASENAME}" "./feed.xml"; then
  echo "Episode with file ${AUDIO_BASENAME} already exists in feed.xml"
  exit 1
fi

echo "-> Getting R2 public URL"
R2_DEV_URL="$(npx wrangler@4.81.1 r2 bucket dev-url get "$AUDIO_BUCKET" | rg -o "https://[^']+\\.r2\\.dev" -m 1)"
if [ -z "$R2_DEV_URL" ]; then
  echo "Could not resolve R2 dev URL for bucket $AUDIO_BUCKET"
  exit 1
fi
AUDIO_URL="${R2_DEV_URL}/${AUDIO_BASENAME}"

echo "-> Uploading $AUDIO_BASENAME to R2"
# Cache-Control on the object is what r2.dev / custom domains use for CDN + browser TTL (see R2 docs).
npx wrangler@4.81.1 r2 object put "${AUDIO_BUCKET}/${AUDIO_BASENAME}" \
  --file "$MP3_FILE" \
  --content-type audio/mpeg \
  --cache-control "public, max-age=31536000, immutable" \
  --remote

echo "-> Updating feed.xml and index.html"
python3 "./scripts/publish_episode.py" \
  --feed "./feed.xml" \
  --index "./index.html" \
  --title "$TITLE" \
  --description "$DESCRIPTION" \
  --audio-url "$AUDIO_URL" \
  --audio-length "$AUDIO_SIZE" \
  --duration-seconds "$AUDIO_DURATION_SECONDS" \
  --pub-date-rfc2822 "$PUB_DATE"

echo "-> Validating feed.xml"
xmllint --noout "./feed.xml"

echo "-> Deploying to Cloudflare Pages"
mkdir -p dist
cp -f index.html feed.xml app.js cover.jpg cover-300x300.jpg cover-800x800.jpg cover-1600x1600.jpg cover-3000x3000.jpg konstantin_elmo.jpeg README.md dist/
NULLGLOB_STATE="$(shopt -p nullglob || true)"
shopt -s nullglob
for mix_html in mix-*.html studio-mix-*.html; do
  [ -f "$mix_html" ] && cp -f "$mix_html" dist/
done
eval "$NULLGLOB_STATE"
npx wrangler@4.81.1 pages deploy dist --project-name "$PAGES_PROJECT"

echo ""
echo "Done."
echo "Feed: https://waxhelsinki.pages.dev/feed.xml"
echo "Site: https://waxhelsinki.pages.dev"
echo "Episode audio: $AUDIO_URL"
