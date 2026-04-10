# wax helsinki podcast

Live URLs:

- Site: `https://waxhelsinki.pages.dev`
- Feed: `https://waxhelsinki.pages.dev/feed.xml`

## Add a new episode (one command)

Use:

```bash
./publish_episode.sh <mp3-file> "<episode-title>" "<episode-description>"
```

Example:

```bash
./publish_episode.sh 3.mp3 "Mix 003" "Third wax helsinki mix."
```

What this does automatically:

1. Uploads the MP3 to R2 bucket `waxhelsinki-audio`
2. Adds a new episode item to `feed.xml`
3. Adds a new episode card to `index.html`
4. Deploys updated site/feed to Cloudflare Pages project `waxhelsinki`

## Requirements

- Wrangler auth is already active (`npx wrangler@4.81.1 whoami`)
- R2 bucket exists and is public: `waxhelsinki-audio`
- `ffprobe`, `python3`, and `xmllint` installed

## Manual R2 upload (minimal)

1. Put credentials in `.env` and load them:

```bash
source .env
```

2. Upload audio to R2:

```bash
aws s3 cp "<local-file>.mp3" "s3://${R2_BUCKET}/<target-name>.mp3" --endpoint-url "${R2_ENDPOINT}" --content-type "audio/mpeg"
```
