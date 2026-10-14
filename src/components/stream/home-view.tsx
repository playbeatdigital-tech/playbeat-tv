"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  Play,
  Radio,
  SearchX,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { qualityLabel, type CategoryMeta, type StreamChannel } from "@/lib/stream";
import type { HeroItem, HomeRow } from "@/lib/spotlight";

/* ================================================================== */
/*  HomeView — Playbeat TV storefront: inset hero carousel,            */
/*  "Now playing" spotlight duo, discovery rails, popular channels.    */
/* ================================================================== */

export function HomeView({
  hero,
  rows,
  popular,
  categories,
  catCounts,
  total,
  countriesCount,
  onPlay,
  isFavorite,
  onToggleFavorite,
  onBrowseCategory,
  onBrowseAll,
  onAbout,
}: {
  hero: HeroItem[];
  rows: HomeRow[];
  popular: HomeRow[];
  categories: CategoryMeta[];
  catCounts: Record<string, number>;
  total: number;
  countriesCount: number;
  onPlay: (ch: StreamChannel) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onBrowseCategory: (cat: string) => void;
  onBrowseAll: () => void;
  onAbout: () => void;
}) {
  const [active, setActive] = useState(0);
  const count = hero.length;

  /* auto-advance the spotlight every 9s; timer resets on manual selection */
  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, 9000);
    return () => clearInterval(t);
  }, [active, count]);

  const current = hero[active];
  const fav = current ? isFavorite(current.channel.id) : false;

  const chipCategories = useMemo(() => {
    const featured = [
      "news",
      "entertainment",
      "music",
      "movies",
      "series",
      "sports",
      "kids",
      "documentary",
    ];
    const picked = featured
      .map((id) => categories.find((c) => c.id === id))
      .filter((c): c is CategoryMeta => !!c);
    const rest = [...categories]
      .filter((c) => !featured.includes(c.id))
      .sort((a, b) => (catCounts[b.id] ?? 0) - (catCounts[a.id] ?? 0));
    return { picked, rest };
  }, [categories, catCounts]);

  if (!current) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-32 text-center">
        <SearchX className="size-10 text-zinc-700" />
        <p className="text-sm text-zinc-500">
          The channel catalog is empty — rebuild the data bundle and refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ============================== HERO ============================== */}
      <section aria-label="Featured spotlight" className="px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="relative min-h-[400px] overflow-hidden rounded-3xl border border-white/5 lg:min-h-[440px]">
          {/* backdrops (crossfade) */}
          <div className="absolute inset-0" aria-hidden="true">
            {hero.map((h, i) => (
              <img
                key={h.channel.id}
                src={h.backdrop}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                className={cn(
                  "absolute inset-0 size-full object-cover transition-opacity duration-1000",
                  i === active ? "opacity-100" : "opacity-0"
                )}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-[#07070f] via-[#07070f]/55 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070f] via-transparent to-[#07070f]/40" />
          </div>

          {/* top-right tag, à la reference */}
          <span className="absolute right-5 top-5 z-10 hidden rounded-md border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-300 backdrop-blur sm:block">
            Free live TV
          </span>

          {/* content */}
          <div className="relative z-10 flex min-h-[400px] flex-col justify-end p-6 sm:min-h-[440px] sm:p-10">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-semibold uppercase tracking-[0.24em]">
              <span className="inline-flex items-center gap-2 text-amber-300">
                <span className="size-1.5 animate-pulse rounded-full bg-rose-500" />
                Turn up the moment
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">
                {categoryLabel(current.channel, categories)} ·{" "}
                {qualityLabel(current.channel)}
              </span>
            </p>

            <h1 className="font-display mt-4 max-w-3xl text-4xl font-extrabold leading-[1.04] text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.8)] sm:text-6xl lg:text-7xl">
              {splitHeadline(current.tagline)[0]}{" "}
              <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                {splitHeadline(current.tagline)[1]}
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300/85 sm:text-[15px]">
              {current.description}
            </p>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Now streaming · {current.channel.flag} {current.channel.name} ·{" "}
              {current.channel.srcs.length} live source
              {current.channel.srcs.length === 1 ? "" : "s"}
            </p>

            {/* actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onPlay(current.channel)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-6 text-sm font-bold text-zinc-950 shadow-xl shadow-amber-500/25 transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-amber-300"
              >
                Watch live now
                <ArrowUpRight className="size-4" />
              </button>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-medium text-zinc-100 backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-300">
                    <Info className="size-4" />
                    View Details
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={12}
                  className="w-80 border-white/10 bg-[#0d0d1c]/95 p-0 text-zinc-100 backdrop-blur-xl"
                >
                  <ChannelDetails
                    channel={current.channel}
                    categories={categories}
                    onBrowseCategory={onBrowseCategory}
                  />
                </PopoverContent>
              </Popover>

              <button
                onClick={() => onToggleFavorite(current.channel.id)}
                aria-pressed={fav}
                aria-label={
                  fav
                    ? `Remove ${current.channel.name} from My List`
                    : `Add ${current.channel.name} to My List`
                }
                className={cn(
                  "grid size-11 place-items-center rounded-full border backdrop-blur transition-colors",
                  fav
                    ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
                    : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Heart className={cn("size-4.5", fav && "fill-amber-300")} />
              </button>
            </div>

            {/* bottom bar: dots left, counter + arrows right */}
            <div className="mt-9 flex items-center justify-between gap-4">
              <div
                className="flex items-center gap-1.5"
                role="tablist"
                aria-label="Spotlight selection"
              >
                {hero.map((h, i) => (
                  <button
                    key={h.channel.id}
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Show ${h.channel.name}`}
                    onClick={() => setActive(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === active
                        ? "w-7 bg-amber-400"
                        : "w-1.5 bg-white/25 hover:bg-white/50"
                    )}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="mr-1 font-mono text-xs text-zinc-400">
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(count).padStart(2, "0")}
                </span>
                <button
                  onClick={() => setActive((i) => (i - 1 + count) % count)}
                  aria-label="Previous featured channel"
                  className="grid size-9 place-items-center rounded-full border border-white/15 bg-black/30 text-zinc-300 backdrop-blur transition-colors hover:border-amber-400/60 hover:text-amber-300"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => setActive((i) => (i + 1) % count)}
                  aria-label="Next featured channel"
                  className="grid size-9 place-items-center rounded-full border border-white/15 bg-black/30 text-zinc-300 backdrop-blur transition-colors hover:border-amber-400/60 hover:text-amber-300"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================== NOW PLAYING HEADER ====================== */}
      <section
        aria-label="Now playing"
        className="mx-auto mt-10 w-full max-w-[1400px] px-3 sm:px-5"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400">
              Playbeat TV · Live &amp; 24/7
            </p>
            <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Your world.{" "}
              <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                Now playing.
              </span>
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500">
              Discover your next favourite channel with Playbeat.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3.5 py-1.5 font-mono text-[11px] font-semibold text-amber-300">
            <Radio className="size-3.5" />
            {total.toLocaleString()} channels
          </span>
        </div>
      </section>

      {/* ======================= SPOTLIGHT DUO ======================= */}
      <section
        aria-label="Channel spotlight"
        className="mx-auto mt-6 w-full max-w-[1400px] px-3 sm:px-5"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <SpotlightCard
            channel={hero[0].channel}
            categories={categories}
            onPlay={onPlay}
          />
          <ChannelSpotlightCard
            channel={hero[1] ? hero[1].channel : hero[0].channel}
            categories={categories}
            onPlay={onPlay}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onBrowseCategory={onBrowseCategory}
          />
        </div>
      </section>

      {/* ====================== EXPLORE CATEGORIES ====================== */}
      <section
        aria-label="Explore categories"
        className="mx-auto mt-10 w-full max-w-[1400px] px-3 sm:px-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Explore categories
          </span>
          {chipCategories.picked.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onBrowseCategory(cat.id)}
              className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-white"
            >
              {cat.name}
              <span className="ml-1.5 font-mono text-[10px] text-zinc-600">
                {catCounts[cat.id] ?? 0}
              </span>
            </button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-400/20">
                All categories
                <ChevronDown className="size-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={10}
              className="w-80 border-white/10 bg-[#0d0d1c]/95 p-3 backdrop-blur-xl"
            >
              <div className="grid max-h-72 grid-cols-2 gap-1 overflow-y-auto">
                {chipCategories.rest.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onBrowseCategory(cat.id)}
                    className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-amber-400/15 hover:text-white"
                  >
                    {cat.name}
                    <span className="font-mono text-[10px] text-zinc-600">
                      {catCounts[cat.id] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <span className="ml-auto hidden font-mono text-[11px] text-zinc-600 sm:block">
            {total.toLocaleString()} channels · {countriesCount} countries · free-to-air
          </span>
        </div>
      </section>

      {/* ============================== ROWS ============================== */}
      <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-5">
        {rows.slice(0, 3).map((row) => (
          <ContentRow
            key={row.id}
            row={row}
            categories={categories}
            onPlay={onPlay}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onExplore={() =>
              row.category ? onBrowseCategory(row.category) : onBrowseAll()
            }
          />
        ))}

        {/* ================= POPULAR CHANNELS ================= */}
        <PopularSection
          popular={popular}
          categories={categories}
          total={total}
          onPlay={onPlay}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onBrowseCategory={onBrowseCategory}
          onBrowseAll={onBrowseAll}
        />

        {rows.slice(3).map((row) => (
          <ContentRow
            key={row.id}
            row={row}
            categories={categories}
            onPlay={onPlay}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onExplore={() =>
              row.category ? onBrowseCategory(row.category) : onBrowseAll()
            }
          />
        ))}

        {/* ====================== PREMIUM BANNER ====================== */}
        <SpotlightBanner total={total} onBrowseAll={onBrowseAll} onAbout={onAbout} />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Hero headline splitter — amber-gradients the final word            */
/* ================================================================== */

function splitHeadline(tagline: string): [string, string] {
  const idx = tagline.lastIndexOf(" ");
  if (idx <= 0) return [tagline, ""];
  return [tagline.slice(0, idx), tagline.slice(idx + 1)];
}

/* ================================================================== */
/*  Spotlight duo cards                                                */
/* ================================================================== */

function SpotlightCard({
  channel,
  categories,
  onPlay,
}: {
  channel: StreamChannel;
  categories: CategoryMeta[];
  onPlay: (ch: StreamChannel) => void;
}) {
  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-amber-400/[0.07] via-[#101020] to-[#0a0a15]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(251,191,36,0.12),transparent_62%)]" />

      {/* top badges */}
      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
        <span className="size-1.5 animate-pulse rounded-full bg-white" />
        Live
      </span>
      <span className="absolute right-4 top-4 rounded-md bg-white/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-200 backdrop-blur">
        {channel.cats[0]
          ? categoryNameOf(channel.cats[0], categories)
          : "General"}
      </span>

      {/* centered logo on white tile */}
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
        <span className="grid size-24 place-items-center rounded-2xl bg-white p-3 shadow-2xl shadow-black/40">
          {channel.logo ? (
             
            <img
              src={channel.logo}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Radio className="size-8 text-zinc-500" />
          )}
        </span>
      </div>

      {/* bottom info */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            In the spotlight
          </p>
          <h3 className="font-display mt-1 truncate text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {channel.name}
          </h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {channel.country || "INT"} ·{" "}
            {channel.cats[0]
              ? categoryNameOf(channel.cats[0], categories)
              : "General"}{" "}
            · Live
          </p>
          <button
            onClick={() => onPlay(channel)}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-4 text-[13px] font-bold text-zinc-950 transition-all hover:brightness-110"
          >
            <Play className="size-3.5 fill-current" />
            Watch live
          </button>
        </div>
        <button
          onClick={() => onPlay(channel)}
          aria-label={`Play ${channel.name}`}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-zinc-950 shadow-xl shadow-amber-500/30 transition-transform hover:scale-105"
        >
          <Play className="size-6 fill-current" />
        </button>
      </div>
    </div>
  );
}

function ChannelSpotlightCard({
  channel,
  categories,
  onPlay,
  isFavorite,
  onToggleFavorite,
  onBrowseCategory,
}: {
  channel: StreamChannel;
  categories: CategoryMeta[];
  onPlay: (ch: StreamChannel) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onBrowseCategory: (cat: string) => void;
}) {
  const fav = isFavorite(channel.id);
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">Channel spotlight</h3>
        <Sparkles className="size-4 text-amber-400" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-2">
          {channel.logo ? (
             
            <img
              src={channel.logo}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Radio className="size-5 text-zinc-500" />
          )}
        </span>
        <div className="min-w-0">
          <button
            onClick={() => onPlay(channel)}
            className="block max-w-full truncate text-left text-[15px] font-bold text-white hover:text-amber-300"
          >
            {channel.name}
          </button>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {channel.cats[0]
              ? categoryNameOf(channel.cats[0], categories)
              : "General"}{" "}
            · Live broadcast
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-zinc-400">
        Open the player to watch live and explore the full lineup — free,
        no account, straight in your browser.
      </p>

      <div className="mt-5 space-y-2.5">
        <button
          onClick={() => onToggleFavorite(channel.id)}
          aria-pressed={fav}
          className={cn(
            "flex h-10 w-full items-center justify-center gap-2 rounded-full border text-[13px] font-medium transition-colors",
            fav
              ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
              : "border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
          )}
        >
          <Heart className={cn("size-4", fav && "fill-amber-300")} />
          {fav ? "In My List" : "Add to Favorites"}
        </button>
        <button
          onClick={() =>
            onBrowseCategory(channel.cats[0] ?? "general")
          }
          className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 text-[13px] font-medium text-zinc-200 transition-colors hover:bg-white/10"
        >
          <CalendarClock className="size-4" />
          Browse{" "}
          {channel.cats[0]
            ? categoryNameOf(channel.cats[0], categories)
            : "General"}
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Popular channels — chips + poster grid (reference bottom block)    */
/* ================================================================== */

const POPULAR_VISIBLE = 10;

function PopularSection({
  popular,
  categories,
  total,
  onPlay,
  isFavorite,
  onToggleFavorite,
  onBrowseCategory,
  onBrowseAll,
}: {
  popular: HomeRow[];
  categories: CategoryMeta[];
  total: number;
  onPlay: (ch: StreamChannel) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onBrowseCategory: (cat: string) => void;
  onBrowseAll: () => void;
}) {
  const [chipIdx, setChipIdx] = useState(0);
  const row = popular?.[chipIdx];

  if (!row || row.channels.length === 0) return null;

  return (
    <section className="mt-12" aria-label="Popular channels">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white sm:text-xl">
          <span className="grid size-8 place-items-center rounded-lg bg-amber-400/15">
            <Trophy className="size-4 text-amber-400" />
          </span>
          Popular channels
        </h3>
        <button
          onClick={onBrowseAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 transition-colors hover:text-amber-200"
        >
          View all {total.toLocaleString()}
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-1.5" role="group" aria-label="Popular category">
        {popular.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setChipIdx(i)}
            aria-pressed={i === chipIdx}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              i === chipIdx
                ? "bg-amber-400 text-zinc-950"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
            )}
          >
            {p.title}
          </button>
        ))}
        <span className="ml-1 hidden font-mono text-[10px] text-zinc-600 sm:inline">
          {row.category
            ? `${row.channels.length} top picks`
            : "highest quality + multi-source"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {row.channels.slice(0, POPULAR_VISIBLE).map((ch) => (
          <PosterCard
            key={ch.id}
            channel={ch}
            hue={row.hue}
            categories={categories}
            onPlay={onPlay}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {row.category && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => onBrowseCategory(row.category as string)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 text-xs font-medium text-zinc-200 transition-colors hover:border-amber-400/40 hover:text-amber-300"
          >
            Explore all {row.title.toLowerCase()}
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}
      {/* keeps the layout honest: chips + grid only */}
    </section>
  );
}

/* ================================================================== */
/*  Content row (horizontal carousel with arrows)                      */
/* ================================================================== */

function ContentRow({
  row,
  categories,
  onPlay,
  isFavorite,
  onToggleFavorite,
  onExplore,
}: {
  row: HomeRow;
  categories: CategoryMeta[];
  onPlay: (ch: StreamChannel) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  onExplore: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }, []);

  return (
    <section className="mt-12" aria-label={row.title}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            {row.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{row.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 transition-colors hover:text-amber-200"
          >
            Explore
            <ArrowRight className="size-3.5" />
          </button>
          <button
            onClick={() => scroll(-1)}
            aria-label={`Scroll ${row.title} left`}
            className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label={`Scroll ${row.title} right`}
            className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="scrollbar-hide -mx-1 flex snap-x gap-3.5 overflow-x-auto px-1 pb-1 sm:gap-4"
      >
        {row.variant === "poster"
          ? row.channels.map((ch) => (
              <div
                key={ch.id}
                className="w-[148px] shrink-0 snap-start sm:w-[168px]"
              >
                <PosterCard
                  channel={ch}
                  hue={row.hue}
                  categories={categories}
                  onPlay={onPlay}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ))
          : row.channels.map((ch) => (
              <WideCard
                key={ch.id}
                channel={ch}
                hue={row.hue}
                categories={categories}
                onPlay={onPlay}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Cards                                                              */
/* ================================================================== */

interface CardProps {
  channel: StreamChannel;
  hue: string;
  categories: CategoryMeta[];
  onPlay: (ch: StreamChannel) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

function cardMeta(channel: StreamChannel, categories: CategoryMeta[]) {
  const first = channel.cats[0]
    ? categoryNameOf(channel.cats[0], categories)
    : "General";
  const rest = channel.cats
    .slice(0, 3)
    .map((c) => categoryNameOf(c, categories))
    .join(" · ");
  return { first, rest };
}

/* Exported for reuse by the dedicated category discovery pages. */
export const PosterCard = memo(function PosterCard({
  channel,
  hue,
  categories,
  onPlay,
  isFavorite,
  onToggleFavorite,
}: CardProps) {
  const fav = isFavorite(channel.id);
  const meta = cardMeta(channel, categories);
  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Watch ${channel.name}`}
        onClick={() => onPlay(channel)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPlay(channel);
          }
        }}
        className={cn(
          "group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br transition-all duration-300 hover:scale-[1.03] hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-950/40 focus-visible:outline-2 focus-visible:outline-amber-400",
          hue
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(251,191,36,0.16),transparent_68%)]" />
        {channel.logo ? (
           
          <img
            src={channel.logo}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 m-auto max-h-[42%] max-w-[70%] object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Radio className="absolute inset-0 m-auto size-8 text-zinc-700" />
        )}

        {/* badges */}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-rose-400 backdrop-blur-sm">
          <span className="size-1 animate-pulse rounded-full bg-rose-500" />
          Live
        </span>
        <span className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-300 backdrop-blur-sm">
          {qualityLabel(channel)}
        </span>

        {/* hover overlay */}
        <div className="absolute inset-0 bg-black/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-zinc-950 opacity-0 shadow-xl shadow-amber-900/40 transition-all duration-300 group-hover:opacity-100">
          <Play className="size-5 fill-current" />
        </span>

        {/* favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel.id);
          }}
          aria-label={fav ? `Remove ${channel.name} from My List` : `Add ${channel.name} to My List`}
          aria-pressed={fav}
          className={cn(
            "absolute bottom-2 right-2 grid size-7 place-items-center rounded-full bg-black/60 backdrop-blur-sm transition-all hover:bg-black",
            fav
              ? "text-amber-300 opacity-100"
              : "text-zinc-400 opacity-0 hover:text-white group-hover:opacity-100"
          )}
        >
          <Heart className={cn("size-3.5", fav && "fill-amber-300")} />
        </button>
      </div>

      <div className="mt-2.5 px-0.5">
        <p className="truncate text-[13px] font-semibold text-zinc-100" title={channel.name}>
          {channel.flag ? `${channel.flag} ` : ""}
          {channel.name}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Live · {meta.first} · {qualityLabel(channel)}
        </p>
        <p className="truncate text-[11px] text-zinc-600">{meta.rest}</p>
      </div>
    </div>
  );
});

const WideCard = memo(function WideCard({
  channel,
  hue,
  categories,
  onPlay,
  isFavorite,
  onToggleFavorite,
}: CardProps) {
  const fav = isFavorite(channel.id);
  const meta = cardMeta(channel, categories);
  return (
    <div className="w-[218px] shrink-0 snap-start sm:w-[248px]">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Watch ${channel.name}`}
        onClick={() => onPlay(channel)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPlay(channel);
          }
        }}
        className={cn(
          "group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-950/40 focus-visible:outline-2 focus-visible:outline-amber-400",
          hue
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(251,191,36,0.14),transparent_70%)]" />
        {channel.logo ? (
           
          <img
            src={channel.logo}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 m-auto max-h-[46%] max-w-[54%] object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Radio className="absolute inset-0 m-auto size-7 text-zinc-700" />
        )}

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-rose-400 backdrop-blur-sm">
          <span className="size-1 animate-pulse rounded-full bg-rose-500" />
          Live
        </span>
        <span className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-300 backdrop-blur-sm">
          {qualityLabel(channel)}
        </span>

        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute inset-0 m-auto grid size-11 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-zinc-950 opacity-0 shadow-xl shadow-amber-900/40 transition-all duration-300 group-hover:opacity-100">
          <Play className="size-4.5 fill-current" />
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel.id);
          }}
          aria-label={fav ? `Remove ${channel.name} from My List` : `Add ${channel.name} to My List`}
          aria-pressed={fav}
          className={cn(
            "absolute bottom-2 right-2 grid size-7 place-items-center rounded-full bg-black/60 backdrop-blur-sm transition-all hover:bg-black",
            fav
              ? "text-amber-300 opacity-100"
              : "text-zinc-400 opacity-0 hover:text-white group-hover:opacity-100"
          )}
        >
          <Heart className={cn("size-3.5", fav && "fill-amber-300")} />
        </button>
      </div>

      <div className="mt-2.5 px-0.5">
        <p className="truncate text-[13px] font-semibold text-zinc-100" title={channel.name}>
          {channel.flag ? `${channel.flag} ` : ""}
          {channel.name}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Live · {meta.first} · {qualityLabel(channel)}
        </p>
      </div>
    </div>
  );
});

/* ================================================================== */
/*  Channel details popover (hero "View Details")                      */
/* ================================================================== */

function ChannelDetails({
  channel,
  categories,
  onBrowseCategory,
}: {
  channel: StreamChannel;
  categories: CategoryMeta[];
  onBrowseCategory: (cat: string) => void;
}) {
  return (
    <div className="p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
        Channel details
      </p>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Status</dt>
          <dd className="inline-flex items-center gap-1.5 font-medium text-rose-400">
            <span className="size-1.5 animate-pulse rounded-full bg-rose-500" />
            Broadcasting live
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Origin</dt>
          <dd className="font-medium text-zinc-200">
            {channel.flag} {channel.country || "International"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Quality</dt>
          <dd className="font-medium text-amber-300">{qualityLabel(channel)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Stream sources</dt>
          <dd className="font-medium text-zinc-200">{channel.srcs.length}</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {channel.cats.slice(0, 4).map((cat) => (
          <button
            key={cat}
            onClick={() => onBrowseCategory(cat)}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300 transition-colors hover:border-amber-400/40 hover:text-white"
          >
            {categoryNameOf(cat, categories)}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
        Public free-to-air stream indexed by iptv-org. Availability can vary by
        region.
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Premium banner ("Free & open spotlight")                           */
/* ================================================================== */

function SpotlightBanner({
  total,
  onBrowseAll,
  onAbout,
}: {
  total: number;
  onBrowseAll: () => void;
  onAbout: () => void;
}) {
  return (
    <section
      aria-label="Open source spotlight"
      className="relative mb-14 mt-14 overflow-hidden rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-950/40 via-[#161006] to-[#0a0714]"
    >
      <img
        src="/hero/banner-open.png"
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover opacity-40 lg:left-1/4 lg:w-3/4 lg:opacity-90 lg:[mask-image:linear-gradient(to_right,transparent,black_45%)]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0810] via-[#0b0810]/70 to-transparent lg:via-[#0b0810]/30" />

      <div className="relative z-10 max-w-xl p-6 sm:p-9 lg:p-11">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">
          Playbeat TV · Free &amp; open
        </p>
        <h3 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          The Open Catalog · {total.toLocaleString()} channels live
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300/85">
          Every stream here is publicly accessible free-to-air television,
          indexed by the open-source iptv-org project and played through hls.js.
          No high-risk streaming sites, no accounts, no tracking — just open
          television, the way the index intended.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={onBrowseAll}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-5 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110"
          >
            <Play className="size-4 fill-current" />
            Browse all channels
          </button>
          <button
            onClick={onAbout}
            className="inline-flex h-10 items-center rounded-full border border-white/15 bg-white/5 px-5 text-sm font-medium text-zinc-100 backdrop-blur transition-colors hover:bg-white/10"
          >
            <Info className="mr-2 size-4" />
            Content policy
          </button>
        </div>
      </div>

      {/* floating mini card, mirrors the reference layout */}
      <div className="absolute bottom-6 right-6 z-10 hidden w-60 items-center gap-3 rounded-xl border border-white/10 bg-black/55 p-3 backdrop-blur-xl xl:flex">
        <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-amber-400/50 to-yellow-600/30">
          <img src="/hero/banner-open.png" alt="" loading="lazy" className="size-full object-cover" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold text-zinc-100">
            The Open Catalog
          </span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Live TV · 100% free
          </span>
        </span>
      </div>
    </section>
  );
}

/* ---------- category label helpers ---------- */

function categoryNameOf(catId: string, categories: CategoryMeta[]): string {
  return categories.find((c) => c.id === catId)?.name ?? catId;
}

function categoryLabel(channel: StreamChannel, categories: CategoryMeta[]): string {
  return channel.cats[0] ? categoryNameOf(channel.cats[0], categories) : "General";
}
