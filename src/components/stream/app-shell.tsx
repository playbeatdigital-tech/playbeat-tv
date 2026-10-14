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
  ArrowUpRight,
  Bookmark,
  Clapperboard,
  Compass,
  Database,
  Film,
  Github,
  Heart,
  History,
  Info,
  Menu,
  Newspaper,
  PanelRight,
  Play,
  Radio,
  Search,
  Trophy,
  Tv,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PlayerDialog } from "@/components/stream/player-dialog";
import { HomeView } from "@/components/stream/home-view";
import { StreamApp, type StreamAppProps } from "@/components/stream/stream-app";
import { CategoryView } from "@/components/stream/category-view";
import { ChannelsPanel } from "@/components/stream/channels-panel";
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

type View = "home" | "tv" | "category" | "collection" | "about";

export interface TvPreset {
  category: string;
  myList: boolean;
  recents: boolean;
  focusSearch: boolean;
  navKey: number;
}

const DEFAULT_PRESET: TvPreset = {
  category: "all",
  myList: false,
  recents: false,
  focusSearch: false,
  navKey: 0,
};

/* the two editorial categories promoted into the top nav, à la reference */
const TOP_NAV_CATS = ["movies", "series", "sports", "news"];

/**
 * Playbeat TV storefront chrome: sticky navbar, left browse rail,
 * right "All channels" rail, Home / Live TV / category / Collection /
 * About views, shared HLS player and the site footer. Single route,
 * no login.
 */
export function AppShell({
  hero,
  rows,
  popular,
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
  popular: HomeRow[];
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
  const [navOpen, setNavOpen] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [tvPreset, setTvPreset] = useState<TvPreset>(DEFAULT_PRESET);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const lastNonCategoryView = useRef<View>("home");

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

  /* ---------- deep links (#watch=<id> / #category=<id>) from any view ---------- */
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

  const validCategories = useMemo(
    () => new Set(categories.map((c) => c.id)),
    [categories]
  );

  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  /* ---------- navigation helpers ---------- */
  const goView = useCallback((v: View) => {
    setView(v);
    setNavOpen(false);
    setChannelsOpen(false);
    if (/^#category=/.test(window.location.hash)) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
  }, []);

  const openCategory = useCallback((catId: string, fromHash = false) => {
    setActiveCategory(catId);
    setView((v) => {
      if (v !== "category") lastNonCategoryView.current = v;
      return "category";
    });
    setNavOpen(false);
    setChannelsOpen(false);
    if (!fromHash) {
      window.history.pushState(null, "", `#category=${catId}`);
    }
    window.scrollTo(0, 0);
  }, []);

  /* deep links: #category=<id> (validated) and #watch=<id>, from any view */
  useEffect(() => {
    const handleHash = async () => {
      const cat = /^#category=([\w-]+)$/.exec(window.location.hash);
      if (cat) {
        if (validCategories.has(cat[1])) openCategory(cat[1], true);
        return;
      }
      const m = /^#watch=(.+)$/.exec(window.location.hash);
      if (!m) return;
      const catalog = await ensureCatalog();
      const ch = catalog?.channels.find((c) => c.id === m[1]);
      if (ch) play(ch);
    };
    void handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [play, ensureCatalog, openCategory, validCategories]);

  /* keep the document title in sync with the active view/category */
  useEffect(() => {
    if (view === "category" && activeCategory) {
      const name = categoryNames[activeCategory] ?? activeCategory;
      document.title = `${name} — Playbeat TV`;
    } else if (view === "tv") {
      document.title = "Live TV — Playbeat TV";
    } else if (view === "collection") {
      document.title = "Collection — Playbeat TV";
    } else if (view === "about") {
      document.title = "About & Content Policy — Playbeat TV";
    } else {
      document.title = "Playbeat TV — Free Live TV & Streaming, No Login";
    }
  }, [view, activeCategory, categoryNames]);

  const browseTv = useCallback((preset: Partial<TvPreset>) => {
    setTvPreset((prev) => ({
      category: preset.category ?? "all",
      myList: preset.myList ?? false,
      recents: preset.recents ?? false,
      focusSearch: preset.focusSearch ?? false,
      navKey: prev.navKey + 1,
    }));
    setView("tv");
    setNavOpen(false);
    setChannelsOpen(false);
    if (/^#category=/.test(window.location.hash)) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
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
    initialRecents: tvPreset.recents,
    searchFocusKey: tvPreset.focusSearch ? tvPreset.navKey : 0,
  };

  const catActive = (id: string) => view === "category" && activeCategory === id;

  /* ---------- sidebar model (shared by desktop rail + mobile sheet) ---------- */
  const mainNav: {
    key: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onSelect: () => void;
  }[] = [
    {
      key: "browse",
      label: "Browse",
      icon: <Compass className="size-4" />,
      active: view === "home",
      onSelect: () => goView("home"),
    },
    {
      key: "tv",
      label: "Live TV",
      icon: <Tv className="size-4" />,
      active: view === "tv",
      onSelect: () => browseTv({}),
    },
    ...TOP_NAV_CATS.map((cat) => ({
      key: `cat-${cat}`,
      label: categoryNames[cat] ?? cat,
      icon:
        cat === "movies" ? (
          <Clapperboard className="size-4" />
        ) : cat === "series" ? (
          <Film className="size-4" />
        ) : cat === "sports" ? (
          <Trophy className="size-4" />
        ) : (
          <Newspaper className="size-4" />
        ),
      active: catActive(cat),
      onSelect: () => openCategory(cat),
    })),
  ];

  const secondNav: {
    key: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    active: boolean;
    onSelect: () => void;
  }[] = [
    {
      key: "mylist",
      label: "My List",
      icon: <Heart className="size-4" />,
      badge: favs.length,
      active: false,
      onSelect: () => browseTv({ myList: true }),
    },
    {
      key: "recents",
      label: "Recently watched",
      icon: <History className="size-4" />,
      active: false,
      onSelect: () => browseTv({ recents: true }),
    },
    {
      key: "collection",
      label: "Collection",
      icon: <Database className="size-4" />,
      active: view === "collection",
      onSelect: () => goView("collection"),
    },
    {
      key: "about",
      label: "About & policy",
      icon: <Info className="size-4" />,
      active: view === "about",
      onSelect: () => goView("about"),
    },
  ];

  const sidebarBrandCard = (
    <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-b from-amber-400/[0.08] to-transparent p-4">
      <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        Your front-row seat
      </p>
      <p className="mt-1.5 text-xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
          PLAYBEAT
        </span>
      </p>
      <p className="text-[11px] font-medium text-zinc-400">Free experience</p>
      <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-400">
        <li className="flex items-center gap-1.5">
          <ArrowUpRight className="size-3 text-amber-400" />
          <span className="font-semibold text-zinc-200">{total.toLocaleString()}</span>
          live channels
        </li>
        <li className="flex items-center gap-1.5">
          <ArrowUpRight className="size-3 text-amber-400" />
          <span className="font-semibold text-zinc-200">{countriesCount}</span>
          countries
        </li>
        <li className="flex items-center gap-1.5">
          <ArrowUpRight className="size-3 text-amber-400" />
          <span className="font-semibold text-zinc-200">{categories.length}</span>
          categories
        </li>
        <li className="flex items-center gap-1.5">
          <ArrowUpRight className="size-3 text-amber-400" />
          Free-to-air worldwide
        </li>
      </ul>
      <button
        onClick={() => browseTv({})}
        className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 text-[13px] font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110"
      >
        Explore the lineup
        <ArrowUpRight className="size-3.5" />
      </button>
    </div>
  );

  const sidebarNav = (
    <nav aria-label="Storefront" className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto px-3 py-5 scrollbar-slim">
      <div className="space-y-1">
        {mainNav.map((item) => (
          <button
            key={item.key}
            onClick={item.onSelect}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition-colors",
              item.active
                ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                : "border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {secondNav.map((item) => (
          <button
            key={item.key}
            onClick={item.onSelect}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors",
              item.active
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            )}
          >
            {item.icon}
            {item.label}
            {typeof item.badge === "number" && item.badge > 0 && (
              <span className="ml-auto rounded-full bg-amber-400/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-2">{sidebarBrandCard}</div>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#07070f] text-zinc-100">
      {/* ============================ NAVBAR ============================ */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a15]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-3 sm:gap-4 sm:px-5">
          {/* logo */}
          <button
            onClick={() => goView("home")}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Playbeat TV home"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 shadow-lg shadow-amber-500/25">
              <Play className="size-4 fill-[#0a0a15] text-[#0a0a15]" />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-[15px] font-extrabold tracking-tight text-white">
                PLAYBEAT{" "}
                <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  TV
                </span>
              </span>
              <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                Free live streaming
              </span>
            </span>
          </button>

          {/* search pill */}
          <button
            onClick={() => browseTv({ focusSearch: true })}
            className="ml-1 hidden h-10 flex-1 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 text-left text-sm text-zinc-500 transition-colors hover:border-amber-400/30 hover:text-zinc-400 md:flex lg:max-w-md"
            aria-label="Search channels, movies, series"
          >
            <Search className="size-4 shrink-0" />
            Search channels, movies, series…
          </button>

          <div className="flex-1 md:hidden" />

          {/* top nav pills */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            <button
              onClick={() => goView("home")}
              aria-current={view === "home" ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
                view === "home"
                  ? "bg-amber-400 text-zinc-950"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              Home
            </button>
            <button
              onClick={() => browseTv({})}
              aria-current={view === "tv" ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
                view === "tv"
                  ? "bg-amber-400 text-zinc-950"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              Live TV
            </button>
            {TOP_NAV_CATS.map((cat) => (
              <button
                key={cat}
                onClick={() => openCategory(cat)}
                aria-current={catActive(cat) ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
                  catActive(cat)
                    ? "bg-amber-400 text-zinc-950"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {categoryNames[cat] ?? cat}
              </button>
            ))}
          </nav>

          <div className="hidden flex-1 lg:block" />

          {/* right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setChannelsOpen(true)}
              aria-label="Open all channels panel"
              className="grid size-9 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white xl:hidden"
            >
              <PanelRight className="size-4.5" />
            </button>
            <button
              onClick={() => browseTv({ myList: true })}
              aria-label={`My List, ${favs.length} channels`}
              className="flex size-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="relative">
                <Bookmark className="size-4.5" />
                {favs.length > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-zinc-950">
                    {favs.length}
                  </span>
                )}
              </span>
            </button>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Playbeat TV on GitHub"
              className="hidden size-9 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:grid"
            >
              <Github className="size-4.5" />
            </a>
            <button
              onClick={() => setNavOpen(true)}
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
              className="grid size-9 place-items-center rounded-full text-zinc-300 transition-colors hover:bg-white/5 lg:hidden"
            >
              {navOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ============================ BODY ============================ */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1">
        {/* left rail */}
        <aside
          className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-white/5 lg:block"
          aria-label="Browse navigation"
        >
          {sidebarNav}
        </aside>

        {/* main column */}
        <main className="min-w-0 flex-1">
          {view === "home" && (
            <HomeView
              hero={hero}
              rows={rows}
              popular={popular}
              categories={categories}
              catCounts={catCounts}
              total={total}
              countriesCount={countriesCount}
              onPlay={play}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              onBrowseCategory={openCategory}
              onBrowseAll={() => browseTv({})}
              onAbout={() => goView("about")}
            />
          )}
          {view === "category" && activeCategory && (
            <CategoryView
              key={activeCategory}
              categoryId={activeCategory}
              categories={categories}
              catCounts={catCounts}
              getCatalog={ensureCatalog}
              onPlay={play}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              onOpenCategory={openCategory}
              onBack={() => goView(lastNonCategoryView.current)}
              onOpenInLiveTv={(cat) => browseTv({ category: cat })}
            />
          )}
          {view === "tv" && (
            <div className="px-3 py-5 sm:px-5">
              <StreamApp key={tvPreset.navKey} {...streamProps} />
            </div>
          )}
          {view === "collection" && (
            <div className="px-3 py-5 sm:px-5">{collection}</div>
          )}
          {view === "about" && (
            <div className="px-3 py-6 sm:px-5">{about}</div>
          )}
        </main>

        {/* right rail — All channels */}
        <aside
          className="sticky top-16 hidden h-[calc(100vh-4rem)] w-80 shrink-0 border-l border-white/5 xl:block"
          aria-label="All channels"
        >
          <ChannelsPanel
            categories={categories}
            catCounts={catCounts}
            total={total}
            getCatalog={ensureCatalog}
            onPlay={play}
            className="h-full"
          />
        </aside>
      </div>

      {/* ============================ FOOTER ============================ */}
      <footer className="mt-auto border-t border-white/5 bg-[#05050c] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-amber-300 to-yellow-500">
                <Play className="size-3.5 fill-[#0a0a15] text-[#0a0a15]" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                PLAYBEAT{" "}
                <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  TV
                </span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-zinc-500">
              Turn up the moment. Free live television from the open-source
              iptv-org index — no account, no tracking, no cost, no catch.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["No login", "No tracking", "Open source"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-zinc-400"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Discover
            </h3>
            <ul className="mt-4 space-y-2.5">
              {TOP_NAV_CATS.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => openCategory(cat)}
                    className="text-xs text-zinc-400 transition-colors hover:text-amber-300"
                  >
                    {categoryNames[cat] ?? cat}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => browseTv({})}
                  className="text-xs font-medium text-amber-300 transition-colors hover:text-amber-200"
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
              <li>
                <button onClick={() => goView("home")} className="text-xs text-zinc-400 transition-colors hover:text-amber-300">
                  Browse
                </button>
              </li>
              <li>
                <button onClick={() => browseTv({})} className="text-xs text-zinc-400 transition-colors hover:text-amber-300">
                  Live TV
                </button>
              </li>
              <li>
                <button onClick={() => goView("collection")} className="text-xs text-zinc-400 transition-colors hover:text-amber-300">
                  Collection
                </button>
              </li>
              <li>
                <button onClick={() => goView("about")} className="text-xs text-zinc-400 transition-colors hover:text-amber-300">
                  About &amp; policy
                </button>
              </li>
              <li>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-amber-300"
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
                  className="text-xs text-zinc-400 transition-colors hover:text-amber-300"
                >
                  iptv-org — channel index
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/video-dev/hls.js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 transition-colors hover:text-amber-300"
                >
                  hls.js — playback engine
                </a>
              </li>
              <li>
                <button
                  onClick={() => goView("about")}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-amber-300"
                >
                  <Info className="size-3" /> Content policy
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[11px] leading-relaxed text-zinc-600">
              © 2026 Playbeat TV · Hosts no media — a player &amp; directory for
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

      {/* ============================ MOBILE SHEETS ============================ */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side="left"
          className="w-72 border-white/10 bg-[#0a0a15] p-0 text-zinc-100"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-4">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-amber-300 to-yellow-500">
              <Play className="size-3.5 fill-[#0a0a15] text-[#0a0a15]" />
            </span>
            <span className="text-sm font-extrabold tracking-tight">
              PLAYBEAT{" "}
              <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                TV
              </span>
            </span>
          </div>
          {sidebarNav}
        </SheetContent>
      </Sheet>

      <Sheet open={channelsOpen} onOpenChange={setChannelsOpen}>
        <SheetContent
          side="right"
          className="w-[340px] border-white/10 bg-[#0a0a15] p-0 text-zinc-100 sm:w-[380px]"
        >
          <SheetTitle className="sr-only">All channels</SheetTitle>
          <ChannelsPanel
            categories={categories}
            catCounts={catCounts}
            total={total}
            getCatalog={ensureCatalog}
            onPlay={play}
            className="h-full border-l-0"
          />
        </SheetContent>
      </Sheet>

      {/* ============================ SHARED PLAYER ============================ */}
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
