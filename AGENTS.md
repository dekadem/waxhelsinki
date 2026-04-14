# AGENTS instructions

## New mix publishing policy (mandatory)

When adding a new mix, always use the existing publish pipeline. Do not manually edit generated files.

1. If source audio is not MP3 (for example AIFF), convert it to MP3 first.
2. Run:

```bash
./publish_episode.sh "<mp3-file>" "WAXMIX ###" "<description>"
```

3. Let the script handle all updates:
   - upload audio to R2
   - update `mixes.json`
   - update `feed.xml`
   - regenerate `mix-*.html`
   - deploy to Cloudflare Pages

## Do not do this

- Do not manually create or edit `mix-*.html` pages.
- Do not manually add mix entries to `mixes.json` when publishing a new episode.
- Do not manually patch `feed.xml` for new episodes.

## AIFF to MP3 helper

Example conversion command:

```bash
ffmpeg -y -i "audiofiles/input.aiff" -codec:a libmp3lame -q:a 2 "audiofiles/output.mp3"
```
