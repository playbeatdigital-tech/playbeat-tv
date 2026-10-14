"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  AvailabilityBadge,
  RiskBadge,
  VerificationBadge,
} from "@/components/collection/status";
import {
  buildSafePlaylist,
  CN_CONTENT_TAGS,
  type PlaylistGroupKey,
} from "@/lib/playlist";
import {
  categoryZh,
  hostOf,
  type ResourceItem,
} from "@/lib/collection";
import {
  Copy,
  Check,
  ExternalLink,
  Info,
  ListMusic,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUP_ORDER: Record<PlaylistGroupKey, number> = {
  live: 0,
  anime: 1,
  app: 2,
  player: 3,
  tool: 4,
};

function PlaylistRow({
  item,
  index,
}: {
  item: ResourceItem;
  index: number;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const declared = item.risks.copyright === "low" || item.risks.copyright === "medium";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ description: "复制失败，请手动复制链接" });
    }
  }

  return (
    <li
      className={cn(
        "group flex items-center gap-3 border-b border-zinc-800/60 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-zinc-900/60",
        item.verification.status === "removed" && "opacity-60"
      )}
    >
      <span className="w-7 shrink-0 text-right font-mono text-sm text-zinc-600">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="truncate text-sm font-medium text-zinc-100 hover:text-amber-400"
          >
            {item.name}
          </a>
          <span className="truncate font-mono text-[11px] text-zinc-600">
            {hostOf(item.url)}
          </span>
          <Badge
            variant="secondary"
            className="border-zinc-700/60 bg-zinc-800/80 text-[10px] text-zinc-400"
          >
            {categoryZh(item.category)}
          </Badge>
          {declared && (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-300"
            >
              <ShieldCheck className="size-3" />
              仓库标注为{item.risks.copyright === "low" ? "低" : "中"}风险
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{item.summaryShort || item.summary}</p>
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 md:flex">
        <AvailabilityBadge
          status={item.availability?.status ?? "unchecked"}
          httpStatus={item.availability?.httpStatus}
        />
        <VerificationBadge status={item.verification.status} />
        {item.risks.copyright !== "unknown" && <RiskBadge level={item.risks.copyright!} />}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={copyLink}
          className="size-8 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
          aria-label={`复制 ${item.name} 链接`}
          title="复制链接"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <a href={item.url} target="_blank" rel="noopener noreferrer nofollow">
            <ExternalLink className="size-3.5" />
            打开
          </a>
        </Button>
      </div>
    </li>
  );
}

export function PlaylistView() {
  const [includeTools, setIncludeTools] = useState(true);
  const { toast } = useToast();

  const playlist = useMemo(() => buildSafePlaylist(includeTools), [includeTools]);

  const orderedGroups = useMemo(
    () => [...playlist.groups].sort((a, b) => GROUP_ORDER[a.key] - GROUP_ORDER[b.key]),
    [playlist]
  );

  async function copyAllLinks() {
    const links = orderedGroups
      .flatMap((g) => g.items)
      .map((i, n) => `${String(n + 1).padStart(2, "0")} ${i.name} — ${i.url}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(links);
      toast({ description: `已复制 ${playlist.total} 条链接` });
    } catch {
      toast({ description: "复制失败，请手动复制" });
    }
  }

  return (
    <section className="flex-1" aria-label="安全播放列表">
      {/* Criteria banner */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <div className="space-y-1.5 text-sm leading-relaxed text-zinc-300">
            <p className="font-medium text-amber-300">安全播放列表的收录标准</p>
            <p className="text-zinc-400">
              重要说明：本仓库内
              <span className="text-rose-300">所有在线影视站均被维护者自身标记为高版权风险</span>
              ，因此一律不收录。以下列表仅包含公开合法的 IPTV
              直播源与开源播放器 / 工具，并已按你的要求
              <span className="text-zinc-200">排除中文剧集类内容</span>
              （标签含：{CN_CONTENT_TAGS.join("、")}）与字幕站。
            </p>
            <p className="text-xs text-zinc-500">
              「无版权风险」依据的是仓库维护者的自报标注，不构成法律保证；聚合壳应用与播放器本身不托管内容，播放内容取决于用户配置的来源，请遵守所在地法律法规。
            </p>
          </div>
        </div>
      </div>

      {/* Playlist toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400"
          >
            <ListMusic className="size-3" />
            {playlist.total} 项
          </Badge>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 font-mono text-emerald-300"
          >
            {playlist.declaredCount} 项已标注低/中风险
          </Badge>
          <Badge
            variant="outline"
            className="border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400"
          >
            {playlist.toolsCount} 项开源工具（风险未申报）
          </Badge>
          <Badge
            variant="outline"
            className="border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400"
          >
            已排除 {CN_CONTENT_TAGS.length} 类中文内容标签
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
            <Switch
              checked={includeTools}
              onCheckedChange={setIncludeTools}
              aria-label="包含开源工具"
            />
            包含开源工具（{playlist.toolsCount}）
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllLinks}
            disabled={playlist.total === 0}
            className="h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Copy className="size-3.5" />
            复制全部链接
          </Button>
        </div>
      </div>

      {/* Playlist groups */}
      {playlist.total > 0 ? (
        <div className="mt-4 space-y-5 pb-6">
          {orderedGroups.map((group) => (
            <div
              key={group.key}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-zinc-800 bg-zinc-900/60 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                  <ListMusic className="size-4 text-amber-400" />
                  {group.label}
                  <span className="font-mono text-xs text-zinc-500">{group.items.length}</span>
                </h3>
                <p className="text-xs text-zinc-500">{group.desc}</p>
              </div>
              <ul>
                {group.items.map((item, n) => (
                  <PlaylistRow key={item.id} item={item} index={n} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 py-14 text-center">
          <Trash2 className="size-10 text-zinc-700" />
          <p className="text-sm text-zinc-500">
            当前条件下没有可收录的资源（已排除全部高版权风险与中文内容）。
          </p>
        </div>
      )}
    </section>
  );
}
