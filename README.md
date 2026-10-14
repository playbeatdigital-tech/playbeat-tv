# Playbeat TV — Free Live TV & Streaming, No Login

Playbeat TV is a production-quality, open streaming storefront built from the
[awesome-zhuiju-free](https://github.com/laoma528/awesome-zhuiju-free)
repository. It applies the repository's own copyright-risk research, keeps
only the open and declared-safe subset, and turns it into something you can
actually watch: **7,985 public free-to-air channels streamed in the browser —
no account, no tracking, no ads.**

The app is a single Next.js route with an amber-and-ink IPTV-style
storefront: rotating hero spotlight, curated content rows (including dedicated
**Anime & Animation** and **Series & Dramas** rails), and full **category
discovery pages** for all 28 genres.

## Features

- **Live TV player** — hls.js adaptive streaming with quality badges,
  multi-source fallback (retry / try next source / direct link), tap-to-unmute
  autoplay, LIVE indicator, fullscreen, and shareable deep links (`#watch=<id>`).
- **Storefront home** — auto-advancing hero spotlight over six curated channels
  with AI-generated backdrops, a live "Now playing" spotlight duo, a
  Popular channels chip grid, an always-on **All Channels** side rail with
  per-row play buttons, a left browse rail, and ten discovery rails (Trending, Anime & Animation, Series & Dramas, News, Music,
  Sports Arena, Movies & Cinema, Kids & Family, Documentary & Science,
  Crystal-Clear Masterpieces).
- **Category pages** — every one of the 28 iptv-org genres gets a dedicated
  discovery page (`#category=<id>`): tagline and editorial blurb, live stats
  (channels / countries / HD count / stream sources), co-occurrence-based
  "You may also like" chips, four sort modes, a poster wall with pagination,
  a Play-random button, and an "Open in Live TV" escape hatch into the full
  filterable browser.
- **Live TV browser** — search, 28 category chips with counts, country
  combobox (178 countries), My List toggle, featured rail, paginated grid.
- **Personal lists without accounts** — favorites and continue-watching are
  persisted in `localStorage` only. There is no auth, no analytics, no cookies
  beyond the session.
- **Collection view** — the original 119-resource research index from
  awesome-zhuiju-free, kept browsable for transparency (ratings, risk
  profiles, daily availability checks, safe-playlist view).
- **About & content policy view** — plain-language sourcing, takedown path, and
  limitations.

## Content & copyright posture

- Channels come exclusively from the **iptv-org** index of publicly available
  free-to-air streams — the resource the source repository itself labels as
  low copyright risk. All 53 online streaming sites flagged **high risk** by
  the repository's maintainers are excluded.
- Only HTTPS `.m3u8` streams playable in a browser are indexed. NSFW channels,
  blocked streams, and closed channels are filtered out during the build.
- This app hosts **no media**. It is a player and directory; streams are
  served by third parties. "Copyright-risk-free" reflects declared labels and
  the public-index policy — it is not a legal guarantee, and broadcast rights
  differ by country. Report stream issues via the
  [iptv-org issue tracker](https://github.com/iptv-org/iptv/issues).

## Architecture

```
src/
  app/
    page.tsx                 # server component: builds hero + rows, composes the shell
    api/catalog/route.ts     # serves the 2 MB channel catalog (cached 24 h)
    layout.tsx               # metadata, fonts
  components/
    stream/                  # app shell, home view, category pages, player, live TV browser
    collection/              # research index browser (119 resources)
    ui/                      # shadcn/ui primitives
  lib/
    stream.ts                # client-safe types, filters, localStorage stores
    stream.server.ts         # server-only bundled catalog access
    spotlight.ts             # curated hero defs + home rail builders
    category-pages.ts        # editorial metadata for the 28 category pages
    collection.ts / playlist.ts
  data/
    stream-catalog.json      # 7,985 channels (bundled, also served via API)
    collection.json          # 119 resources from the source repository
public/hero/                 # AI-generated backdrops for hero + banner
scripts/
  build_stream_catalog.py    # rebuilds the catalog from the iptv-org API
  gen_hero_art.sh            # regenerates hero artwork
  prep_collection_data.py    # rebuilds collection.json from the source repo
```

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui ·
hls.js 1.7 · Bun.

## Getting started

```bash
# 1. install
bun install

# 2. run (http://localhost:3000)
bun run dev

# 3. refresh the channel catalog from the live iptv-org API (optional)
python3 scripts/build_stream_catalog.py

# 4. regenerate hero artwork (optional, requires z-ai CLI)
bash scripts/gen_hero_art.sh
```

Lint: `bun run lint`.

## Attribution

- [awesome-zhuiju-free](https://github.com/laoma528/awesome-zhuiju-free)
  (CC BY 4.0) — the curated index this product was built from; its risk
  research drives every exclusion.
- [iptv-org](https://github.com/iptv-org) — channel & stream data.
- [hls.js](https://github.com/video-dev/hls.js) — playback engine.

## License

[MIT](./LICENSE) for the application code. Third-party data and software
remain under their own licenses. This project is not affiliated with any
broadcaster.
