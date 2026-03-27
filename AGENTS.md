# Agent Context

## Video.js Documentation

For Video.js API and React integration:
- Full docs index: https://videojs.org/docs/framework/react/llms.txt
- React component: https://videojs.org/docs/framework/react/reference/react.md
- Options: https://videojs.org/docs/guides/options.md
- Events: https://videojs.org/docs/api/events.md

## Project Structure

Key player components in `src/components/`:
- `HlsPlayer.tsx` - Native HTML5 + HLS.js (audio track support)
- `VideoJsPlayer.tsx` - Video.js library player
- `PlyrEmbed.tsx` - Plyr via CDN
- `WatchPlayerShell.tsx` - Player container with switching

Source format: `{Name}url1;{Name}url2` for multi-source switching (see `src/utils/url.ts`)
