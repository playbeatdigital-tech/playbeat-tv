"use client";

import { memo } from "react";
import { Heart, TvMinimalPlay } from "lucide-react";
import { cn } from "@/lib/utils";
import { qualityLabel, type StreamChannel } from "@/lib/stream";

export const ChannelCard = memo(function ChannelCard({
  channel,
  onPlay,
  isFavorite,
  onToggleFavorite,
}: {
  channel: StreamChannel;
  onPlay: (channel: StreamChannel) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const fav = isFavorite(channel.id);

  return (
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
        "group flex h-full cursor-pointer flex-col gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 transition-colors",
        "hover:border-zinc-600 hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-amber-400"
      )}
    >
      {/* logo tile */}
      <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-lg border border-zinc-800/70 bg-zinc-950/80">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={`${channel.name} logo`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="max-h-20 max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <TvMinimalPlay className="size-8 text-zinc-700" />
        )}
        <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
          {qualityLabel(channel)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel.id);
          }}
          aria-label={fav ? `Remove ${channel.name} from My List` : `Add ${channel.name} to My List`}
          aria-pressed={fav}
          className={cn(
            "absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1.5 transition-colors hover:bg-black",
            fav ? "text-rose-400" : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Heart className={cn("size-3.5", fav && "fill-rose-400")} />
        </button>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-100" title={channel.name}>
          {channel.flag ? `${channel.flag} ` : ""}
          {channel.name}
        </p>
        <p className="truncate text-[11px] text-zinc-500">
          {channel.cats.slice(0, 2).join(" · ") || "general"}
          {channel.srcs.length > 1 ? ` · ${channel.srcs.length} sources` : ""}
        </p>
      </div>
    </div>
  );
});
