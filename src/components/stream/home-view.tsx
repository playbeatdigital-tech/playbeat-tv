"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  Play,
  Radio,
  SearchX,
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
/*  HomeView — cinematic homepage (hero + rails + spotlight banner)    */
/* ================================================================== */

export function HomeView({
  hero,
  rows,
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
      <section aria-label="Featured spotlight" className="relative overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#05050d] via-[#05050d]/60 to-[#05050d]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050d] via-transparent to-[#05050d]/60" />
        </div>

        {/* content */}
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:pb-14 lg:pt-16">
          {/* left: featured channel */}
          <div className="flex flex-col justify-end">
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              <span className="text-violet-300">Featured spotlight</span>
              <span className="text-zinc-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-rose-400">
                <span className="size-1.5 animate-pulse rounded-full bg-rose-500" />
                Live
              </span>
              <span className="text-zinc-600">·</span>
              <span>{categoryLabel(current.channel, categories)}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-amber-300">{qualityLabel(current.channel)}</span>
              <span className="text-zinc-600">·</span>
              <span>
                {current.channel.flag} {countryName(current.channel, categories)}
              </span>
            </p>

            <h1 className="font-display mt-4 text-5xl font-bold leading-[1.02] tracking-tight text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.8)] sm:text-6xl lg:text-7xl">
              {current.channel.name}
            </h1>

            <p className="mt-3 text-base font-medium text-violet-300 sm:text-lg">
              {current.tagline}
            </p>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300/85 sm:text-[15px]">
              {current.description}
            </p>

            <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span>Genres:</span>
              {current.channel.cats.slice(0, 3).map((cat) => (
                <button
                  key={cat}
                  onClick={() => onBrowseCategory(cat)}
                  className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-zinc-300 transition-colors hover:border-violet-400/50 hover:text-white"
                >
                  {categoryNameOf(cat, categories)}
                </button>
              ))}
            </p>

            {/* actions */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onPlay(current.channel)}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-violet-600 px-6 text-sm font-semibold text-white shadow-xl shadow-violet-900/50 transition-all hover:bg-violet-500 hover:shadow-violet-800/50 focus-visible:outline-2 focus-visible:outline-violet-400"
              >
                <Play className="size-4 fill-current" />
                Watch Now
              </button>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-medium text-zinc-100 backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-violet-400">
                    <Info className="size-4" />
                    View Details
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={12}
                  className="w-80 border-white/10 bg-[#0a0a18]/95 p-0 text-zinc-100 backdrop-blur-xl"
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
                  "grid size-11 place-items-center rounded-lg border backdrop-blur transition-colors",
                  fav
                    ? "border-violet-400/50 bg-violet-500/20 text-violet-300"
                    : "border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <Bookmark className={cn("size-4.5", fav && "fill-violet-300")} />
              </button>
            </div>

            {/* dots */}
            <div className="mt-9 flex items-center gap-1.5" role="tablist" aria-label="Spotlight selection">
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
                      ? "w-7 bg-violet-400"
                      : "w-1.5 bg-white/25 hover:bg-white/50"
                  )}
                />
              ))}
            </div>
          </div>

          {/* right: featured selection panel */}
          <aside className="hidden lg:block" aria-label="Featured selection">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <div className="flex items-center justify-between px-2 py-2">
                <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Featured selection
                </h2>
                <div className="flex items-center gap-1">
                  <span className="mr-1 font-mono text-xs text-zinc-500">
                    {active + 1} / {count}
                  </span>
                  <button
                    onClick={() => setActive((i) => (i - 1 + count) % count)}
                    aria-label="Previous featured channel"
                    className="grid size-7 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    onClick={() => setActive((i) => (i + 1) % count)}
                    aria-label="Next featured channel"
                    className="grid size-7 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              <ul className="space-y-1">
                {hero.map((h, i) => {
                  const rowActive = i === active;
                  return (
                    <li key={h.channel.id}>
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-lg p-2 transition-colors",
                          rowActive
                            ? "bg-violet-500/15 ring-1 ring-violet-500/40"
                            : "hover:bg-white/5"
                        )}
                      >
                        <button
                          onClick={() => setActive(i)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          aria-label={`Show ${h.channel.name} in the spotlight`}
                        >
                          <span className="relative grid h-12 w-[74px] shrink-0 place-items-center overflow-hidden rounded-md bg-gradient-to-br from-violet-900/70 via-[#181033] to-fuchsia-900/40">
                            {h.channel.logo ? (
                               
                              <img
                                src={h.channel.logo}
                                alt=""
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                className="max-h-8 max-w-[80%] object-contain"
                              />
                            ) : (
                              <Radio className="size-4 text-zinc-600" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-semibold text-zinc-100">
                              {h.channel.name}
                            </span>
                            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                              Live · {categoryLabel(h.channel, categories)}
                            </span>
                          </span>
                        </button>
                        <button
                          onClick={() => onPlay(h.channel)}
                          aria-label={`Watch ${h.channel.name} now`}
                          className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 bg-black/30 text-zinc-300 transition-colors hover:border-violet-400 hover:bg-violet-600 hover:text-white"
                        >
                          <Play className="size-3.5 fill-current" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ====================== EXPLORE CATEGORIES ====================== */}
      <section
        aria-label="Explore categories"
        className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Explore categories
          </span>
          {chipCategories.picked.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onBrowseCategory(cat.id)}
              className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white"
            >
              {cat.name}
              <span className="ml-1.5 font-mono text-[10px] text-zinc-600">
                {catCounts[cat.id] ?? 0}
              </span>
            </button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/20">
                All categories
                <ChevronDown className="size-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={10}
              className="w-80 border-white/10 bg-[#0a0a18]/95 p-3 backdrop-blur-xl"
            >
              <div className="grid max-h-72 grid-cols-2 gap-1 overflow-y-auto">
                {chipCategories.rest.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onBrowseCategory(cat.id)}
                    className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs text-zinc-300 transition-colors hover:bg-violet-500/15 hover:text-white"
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
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
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

        {/* ====================== SPOTLIGHT BANNER ====================== */}
        <SpotlightBanner total={total} onBrowseAll={onBrowseAll} onAbout={onAbout} />

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
      </div>
    </div>
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
            className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 transition-colors hover:text-violet-200"
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
              <PosterCard
                key={ch.id}
                channel={ch}
                hue={row.hue}
                categories={categories}
                onPlay={onPlay}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
              />
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
    <div className="w-[148px] shrink-0 snap-start sm:w-[168px]">
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
          "group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br transition-all duration-300 hover:scale-[1.03] hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/60 focus-visible:outline-2 focus-visible:outline-violet-400",
          hue
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(139,92,246,0.22),transparent_68%)]" />
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
        <span className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full bg-violet-600/90 text-white opacity-0 shadow-xl shadow-violet-900/60 transition-all duration-300 group-hover:opacity-100">
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
              ? "text-rose-400 opacity-100"
              : "text-zinc-400 opacity-0 hover:text-white group-hover:opacity-100"
          )}
        >
          <Heart className={cn("size-3.5", fav && "fill-rose-400")} />
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
          "group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/60 focus-visible:outline-2 focus-visible:outline-violet-400",
          hue
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.18),transparent_70%)]" />
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
        <span className="absolute inset-0 m-auto grid size-11 place-items-center rounded-full bg-violet-600/90 text-white opacity-0 shadow-xl shadow-violet-900/60 transition-all duration-300 group-hover:opacity-100">
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
              ? "text-rose-400 opacity-100"
              : "text-zinc-400 opacity-0 hover:text-white group-hover:opacity-100"
          )}
        >
          <Heart className={cn("size-3.5", fav && "fill-rose-400")} />
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
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
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
            className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300 transition-colors hover:border-violet-400/40 hover:text-white"
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
/*  Spotlight banner ("Original · Open Source Spotlight")              */
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
      className="relative mt-14 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-950/50 via-[#120b26] to-[#0a0718]"
    >
      { }
      <img
        src="/hero/banner-open.png"
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover opacity-40 lg:left-1/4 lg:w-3/4 lg:opacity-90 lg:[mask-image:linear-gradient(to_right,transparent,black_45%)]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0718] via-[#0a0718]/70 to-transparent lg:via-[#0a0718]/30" />

      <div className="relative z-10 max-w-xl p-6 sm:p-9 lg:p-11">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300">
          Original · Open source spotlight
        </p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
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
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-900/50 transition-colors hover:bg-violet-500"
          >
            <Play className="size-4 fill-current" />
            Browse all channels
          </button>
          <button
            onClick={onAbout}
            className="inline-flex h-10 items-center rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-medium text-zinc-100 backdrop-blur transition-colors hover:bg-white/10"
          >
            <Info className="mr-2 size-4" />
            Content policy
          </button>
        </div>
      </div>

      {/* floating mini card, mirrors the reference layout */}
      <div className="absolute bottom-6 right-6 z-10 hidden w-60 items-center gap-3 rounded-xl border border-white/10 bg-black/55 p-3 backdrop-blur-xl xl:flex">
        <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-violet-700/60 to-fuchsia-700/40">
          { }
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

function countryName(channel: StreamChannel, _categories: CategoryMeta[]): string {
  return channel.country || "International";
}
