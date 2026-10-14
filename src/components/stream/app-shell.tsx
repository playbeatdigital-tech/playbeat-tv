"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Bookmark,
  Clapperboard,
  Github,
  Info,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { PlayerDialog } from "@/components/stream/player-dialog";
import { HomeView } from "@/components/stream/home-view";
import { StreamApp, type StreamAppProps } from "@/components/stream/stream-app";
import { cn } from "@/lib/utils";
import {
  getFavoritesServerSnapshot,
  getFavoritesSnapshot,
  pushRecent,
  subscribeFavorites,
  toggleFavorite,
  type CategoryMeta,
  type CountryMeta,
  type StreamCatalog,
  type StreamChannel,
} from "@/lib/stream";
import type { HeroItem, HomeRow } from "@/lib/spotlight";

type View = "home" | "tv" | "collection" | "about";

const NAV: { key: View; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "tv", label: "Live TV" },
  { key: "collection", label: "Collection" },
  { key: "about", label: "About" },
];

export interface TvPreset {
  category: string;
  myList: boolean;
  focusSearch: boolean;
  navKey: number;
}

const DEFAULT_PRESET: TvPreset = {
  category: "all",
  myList: false,
  focusSearch: false,
  navKey: 0,
};

/**
 * Global application chrome: sticky glass header, Home / Live TV / Collection /
 * About views, shared HLS player and the site footer. Single route, no login.
 */
export function AppShell({
  hero,
  rows,
  categories,
  countries,
  catCounts,
  total,
  countriesCount,
  generatedAt,
  sourceUrl,
  repoUrl,
  collection,
  about,
}: {
  hero: HeroItem[];
  rows: HomeRow[];
  categories: CategoryMeta[];
  countries: CountryMeta[];
  catCounts: Record<string, number>;
  total: number;
  countriesCount: number;
  generatedAt: string;
  sourceUrl: string;
  repoUrl: string;
  collection: React.ReactNode;
  about: React.ReactNode;
}) {
  const [view, setView] = useState<View>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tvPreset, setTvPreset] = useState<TvPreset>(DEFAULT_PRESET);

  /* ---------- favorites ---------- */
  const favs = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot
  );
  const isFavorite = useCallback((id: string) => favs.includes(id), [favs]);
  const onToggleFavorite = useCallback((id: string) => {
    toggleFavorite(id);
  }, []);

  /* ---------- shared player ---------- */
  const [playerChannel, setPlayerChannel] = useState<StreamChannel | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  const play = useCallback((channel: StreamChannel) => {
    setPlayerChannel(channel);
    setPlayerOpen(true);
    pushRecent(channel.id);
    window.history.replaceState(null, "", `#watch=${channel.id}`);
  }, []);

  const closePlayer = useCallback((open: boolean) => {
    setPlayerOpen(open);
    if (!open) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, []);

  /* ---------- deep links (#watch=<id>) from any view ---------- */
  const catalogRef = useRef<StreamCatalog | null>(null);
  const ensureCatalog = useCallback(async (): Promise<StreamCatalog | null> => {
    if (catalogRef.current) return catalogRef.current;
    try {
      const r = await fetch("/api/catalog");
      if (!r.ok) return null;
      const data = (await r.json()) as StreamCatalog;
      catalogRef.current = data;
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const openFromHash = async () => {
      const m = /^#watch=(.+)$/.exec(window.location.hash);
      if (!m) return;
      const catalog = await ensureCatalog();
      const ch = catalog?.channels.find((c) => c.id === m[1]);
      if (ch) play(ch);
    };
    void openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [play, ensureCatalog]);

  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  /* ---------- navigation helpers ---------- */
  const goView = useCallback((v: View) => {
    setView(v);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const browseTv = useCallback((preset: Partial<TvPreset>) => {
    setTvPreset((prev) => ({
      category: preset.category ?? "all",
      myList: preset.myList ?? false,
      focusSearch: preset.focusSearch ?? false,
      navKey: prev.navKey + 1,
    }));
    setView("tv");
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const streamProps: Omit<StreamAppProps, "key"> = {
    featured: hero.map((h) => h.channel),
    categories,
    countries,
    catCounts,
    total,
    generatedAt,
    onPlay: play,
    initialCategory: tvPreset.category,
    initialMyList: tvPreset.myList,
    searchFocusKey: tvPreset.focusSearch ? tvPreset.navKey : 0,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#05050d] text-zinc-100">
      {/* ---------- header ---------- */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05050d]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
          {/* logo */}
          <button
            onClick={() => goView("home")}
            className="flex shrink-0 items-center gap-2"
            aria-label="OpenStream home"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-900/50">
              <Clapperboard className="size-4 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Open
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Stream
              </span>
            </span>
            <Sparkles className="size-3.5 text-violet-400" />
          </button>

          {/* desktop nav */}
          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <button
                key={item.key}
                onClick={() => (item.key === "tv" ? browseTv({}) : goView(item.key))}
                aria-current={view === item.key ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm transition-colors",
                  view === item.key
                    ? "font-semibold text-white"
                    : "text-zinc-400 hover:text-zinc-100"
                )}
              >
                {item.label}
                {view === item.key && (
                  <span className="absolute inset-x-3 -bottom-[9px] h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* right actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => browseTv({ focusSearch: true })}
              aria-label="Search channels"
              className="grid size-9 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Search className="size-4.5" />
            </button>
            <button
              onClick={() => browseTv({ myList: true })}
              aria-label={`My List, ${favs.length} channels`}
              className="relative grid size-9 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Bookmark className="size-4.5" />
              {favs.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white">
                  {favs.length}
                </span>
              )}
            </button>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="iptv-org on GitHub"
              className="hidden size-9 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:grid"
            >
              <Github className="size-4.5" />
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="grid size-9 place-items-center rounded-full text-zinc-300 transition-colors hover:bg-white/5 md:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {menuOpen && (
          <nav
            aria-label="Mobile"
            className="border-t border-white/5 bg-[#05050d]/95 px-4 py-3 backdrop-blur-xl md:hidden"
          >
            {NAV.map((item) => (
              <button
                key={item.key}
                onClick={() => (item.key === "tv" ? browseTv({}) : goView(item.key))}
                className={cn(
                  "block w-full rounded-lg px-3 py-2.5 text-left text-sm",
                  view === item.key
                    ? "bg-violet-500/15 font-semibold text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* ---------- views ---------- */}
      <main className="flex-1">
        {view === "home" && (
          <HomeView
            hero={hero}
            rows={rows}
            categories={categories}
            catCounts={catCounts}
            total={total}
            countriesCount={countriesCount}
            onPlay={play}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onBrowseCategory={(cat) => browseTv({ category: cat })}
            onBrowseAll={() => browseTv({})}
            onAbout={() => goView("about")}
          />
        )}
        {view === "tv" && (
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
            <StreamApp key={tvPreset.navKey} {...streamProps} />
          </div>
        )}
        {view === "collection" && (
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{collection}</div>
        )}
        {view === "about" && (
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">{about}</div>
        )}
      </main>

      {/* ---------- footer ---------- */}
      <footer className="mt-auto border-t border-white/5 bg-[#030309] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
                <Clapperboard className="size-4 text-white" />
              </span>
              <span className="text-lg font-bold">
                Open
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Stream
                </span>
              </span>
              <Sparkles className="size-3.5 text-violet-400" />
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-zinc-500">
              Nightfall-grade free live television. Curated public free-to-air
              channels from the open-source iptv-org index — no account, no
              tracking, no cost.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
                No login
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
                No tracking
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
                Open source
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Discover
            </h3>
            <ul className="mt-4 space-y-2.5">
              {topFooterCategories(categories, catCounts).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => browseTv({ category: cat.id })}
                    className="text-xs text-zinc-400 transition-colors hover:text-violet-300"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => browseTv({})}
                  className="text-xs font-medium text-violet-300 transition-colors hover:text-violet-200"
                >
                  All channels →
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => (item.key === "tv" ? browseTv({}) : goView(item.key))}
                    className="text-xs text-zinc-400 transition-colors hover:text-violet-300"
                  >
                    {item.key === "tv" ? "Browse Live TV" : item.label}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-violet-300"
                >
                  <Github className="size-3" /> Source repo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Open source
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 transition-colors hover:text-violet-300"
                >
                  iptv-org — channel index
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/video-dev/hls.js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 transition-colors hover:text-violet-300"
                >
                  hls.js — playback engine
                </a>
              </li>
              <li>
                <button
                  onClick={() => goView("about")}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-violet-300"
                >
                  <Info className="size-3" /> Content policy
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[11px] leading-relaxed text-zinc-600">
              © 2026 OpenStream · Hosts no media — a player &amp; directory for
              publicly available free-to-air streams. Not affiliated with
              broadcasters.
            </p>
            <p className="text-[11px] text-zinc-600">
              Catalog generated {generatedAt} · {total.toLocaleString()} channels ·{" "}
              {countriesCount} countries
            </p>
          </div>
        </div>
      </footer>

      {/* ---------- shared player ---------- */}
      <PlayerDialog
        channel={playerChannel}
        open={playerOpen}
        onOpenChange={closePlayer}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        categoryNames={categoryNames}
      />
    </div>
  );
}

/* ---------- helpers ---------- */

function topFooterCategories(
  categories: CategoryMeta[],
  counts: Record<string, number>,
  n = 6
): CategoryMeta[] {
  return [...categories]
    .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
    .slice(0, n);
}
