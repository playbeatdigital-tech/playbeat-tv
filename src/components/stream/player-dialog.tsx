"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Loader2,
  Maximize,
  Pause,
  Play,
  RefreshCw,
  SignalHigh,
  Unplug,
  Volume2,
  VolumeX,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { qualityLabel, type StreamChannel } from "@/lib/stream";

type PlayerStatus = "connecting" | "playing" | "error";

/**
 * Outer dialog chrome. The inner PlayerEngine is remounted via `key`
 * whenever the channel changes, which cleanly resets all player state
 * without setState-in-effect patterns.
 */
export function PlayerDialog({
  channel,
  open,
  onOpenChange,
  isFavorite,
  onToggleFavorite,
  categoryNames,
}: {
  channel: StreamChannel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  categoryNames: Record<string, string>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] w-[min(960px,94vw)] max-w-none overflow-hidden border-zinc-800 bg-zinc-950 p-0 text-zinc-100 sm:rounded-xl"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">
          {channel ? `Watching ${channel.name}` : "Player"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Live stream player. No sign-in required.
        </DialogDescription>

        {channel && open && (
          <PlayerEngine
            key={channel.id}
            channel={channel}
            categoryNames={categoryNames}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PlayerEngine({
  channel,
  categoryNames,
  isFavorite,
  onToggleFavorite,
}: {
  channel: StreamChannel;
  categoryNames: Record<string, string>;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const recoverAttempted = useRef(false);

  const [status, setStatus] = useState<PlayerStatus>("connecting");
  const [srcIndex, setSrcIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const srcCount = channel.srcs.length;

  /* attach / detach HLS engine (runs on mount, source switch, retry) */
  useEffect(() => {
    const video = videoRef.current;
    const url = channel.srcs[srcIndex]?.u;
    if (!video || !url) return;

    recoverAttempted.current = false;

    function cleanup() {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    }
    cleanup();
    video.pause();

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 12000,
        fragLoadingTimeOut: 20000,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recoverAttempted.current) {
          recoverAttempted.current = true;
          hls.recoverMediaError();
          return;
        }
        setStatus("error");
      });
    } else {
      // Native HLS (Safari) or unsupported browser: assign directly.
      // Failures surface through the <video> onError handler below.
      video.src = url;
    }

    video.play().catch(() => {
      /* autoplay blocked; user can press play */
    });

    return cleanup;
  }, [channel, srcIndex, attempt]);

  /* video element events -> status */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlaying = () => setStatus("playing");
    video.addEventListener("playing", onPlaying);
    return () => video.removeEventListener("playing", onPlaying);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const goFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen().catch(() => {});
  }, []);

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === "m") {
        toggleMute();
      } else if (e.key.toLowerCase() === "f") {
        goFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, toggleMute, goFullscreen]);

  /* pause + clear hash when unmounting (channel switch / dialog close) */
  useEffect(() => {
    return () => {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    };
  }, []);

  function copyShare() {
    const url = `${window.location.origin}/#watch=${channel.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function retry() {
    setStatus("connecting");
    setAttempt((a) => a + 1);
  }

  const fav = isFavorite(channel.id);

  return (
    <div className="flex flex-col">
      {/* video area */}
      <div ref={containerRef} className="relative aspect-video w-full bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onError={() => setStatus("error")}
          className="size-full bg-black"
          aria-label={`${channel.name} live stream`}
        />

        {/* connecting overlay */}
        {status === "connecting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
            <Loader2 className="size-8 animate-spin text-violet-400" />
            <p className="text-sm text-zinc-300">Connecting to {channel.name}…</p>
          </div>
        )}

        {/* error overlay */}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
            <Unplug className="size-9 text-rose-400" />
            <p className="text-sm font-medium text-zinc-200">Signal unavailable</p>
            <p className="max-w-md text-xs leading-relaxed text-zinc-500">
              This public stream may be offline, geo-restricted, or temporarily
              congested. Try again, switch source, or open the direct link in an
              external player.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                size="sm"
                onClick={retry}
                className="bg-violet-600 text-white hover:bg-violet-500"
              >
                <RefreshCw className="size-3.5" />
                Retry
              </Button>
              {srcCount > 1 && srcIndex < srcCount - 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStatus("connecting");
                    setSrcIndex((i) => i + 1);
                  }}
                  className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                >
                  Try source {srcIndex + 2}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                asChild
                className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
              >
                <a
                  href={channel.srcs[srcIndex]?.u}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  Direct link
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* tap-to-unmute hint */}
        {status === "playing" && muted && (
          <button
            onClick={toggleMute}
            className="absolute left-3 top-3 rounded-full bg-zinc-950/80 px-3 py-1.5 text-xs font-medium text-violet-300 ring-1 ring-violet-500/40 transition-colors hover:bg-zinc-900"
          >
            <VolumeX className="mr-1.5 inline size-3.5" />
            Tap to unmute
          </button>
        )}

        {/* controls bar */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-8">
          <span className="mr-1 inline-flex items-center gap-1.5 rounded bg-rose-600/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            <SignalHigh className="size-3" />
            Live
          </span>
          <button
            onClick={togglePlay}
            aria-label={paused ? "Play" : "Pause"}
            className="rounded-md p-1.5 text-zinc-200 transition-colors hover:bg-white/10"
          >
            {paused ? <Play className="size-4.5" /> : <Pause className="size-4.5" />}
          </button>
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="rounded-md p-1.5 text-zinc-200 transition-colors hover:bg-white/10"
          >
            {muted ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
          </button>
          <div className="flex-1" />
          {srcCount > 1 && (
            <span className="mr-1 hidden rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 sm:inline">
              src {srcIndex + 1}/{srcCount}
            </span>
          )}
          <button
            onClick={copyShare}
            aria-label="Copy share link"
            title="Copy share link"
            className="rounded-md p-1.5 text-zinc-200 transition-colors hover:bg-white/10"
          >
            {copied ? (
              <Check className="size-4.5 text-emerald-400" />
            ) : (
              <Copy className="size-4.5" />
            )}
          </button>
          <button
            onClick={goFullscreen}
            aria-label="Fullscreen"
            className="rounded-md p-1.5 text-zinc-200 transition-colors hover:bg-white/10"
          >
            <Maximize className="size-4.5" />
          </button>
        </div>
      </div>

      {/* info bar */}
      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800/80 p-3.5">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt=""
            className="h-9 w-9 shrink-0 rounded-md bg-zinc-900 object-contain p-1"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-sm font-bold text-violet-400">
            {channel.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-100">
            {channel.flag ? `${channel.flag} ` : ""}
            {channel.name}
          </p>
          <p className="truncate text-xs text-zinc-500">
            {channel.cats
              .slice(0, 2)
              .map((c) => categoryNames[c] ?? c)
              .join(" · ") || "General"}{" "}
            · {qualityLabel(channel)} · public free-to-air stream via iptv-org
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onToggleFavorite(channel.id)}
          aria-pressed={fav}
          className={cn(
            "h-8 border-zinc-700 hover:bg-zinc-800",
            fav ? "text-rose-400" : "text-zinc-300"
          )}
        >
          <Heart className={cn("size-3.5", fav && "fill-rose-400")} />
          {fav ? "In My List" : "Add to My List"}
        </Button>
      </div>
    </div>
  );
}
