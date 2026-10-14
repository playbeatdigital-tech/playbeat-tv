import { items, type ResourceItem } from "@/lib/collection";

/** Tags that mark Chinese drama / series content focus — excluded per user preference. */
export const CN_CONTENT_TAGS = [
  "国内剧",
  "国剧",
  "中文",
  "华语",
  "大陆",
  "热播剧",
  "电视剧",
  "港剧",
  "国产",
];

/** Categories eligible for the safe playlist (streaming-relevant; subtitles etc. excluded). */
export const PLAYLIST_CATEGORIES = [
  "subscription",
  "online_video",
  "video_app",
  "player",
  "open_source",
  "cloud_search",
];

export type PlaylistGroupKey = "live" | "anime" | "player" | "app" | "tool";

export const PLAYLIST_GROUPS: { key: PlaylistGroupKey; label: string; desc: string }[] = [
  {
    key: "live",
    label: "公开直播源",
    desc: "公开、合法的全球 IPTV 频道集合，链接可直接播放",
  },
  {
    key: "anime",
    label: "动漫 / 番剧",
    desc: "开源追番应用，内容以日本动漫为主",
  },
  {
    key: "app",
    label: "影视应用（需自配源）",
    desc: "聚合壳应用本身不存储内容，播放内容取决于用户配置的来源",
  },
  {
    key: "player",
    label: "播放器 / TVBox 壳",
    desc: "开源播放器与 TVBox 空壳，本身不含任何片源",
  },
  {
    key: "tool",
    label: "辅助工具",
    desc: "网盘搜索 / 转存等辅助开源工具",
  },
];

function hasTag(item: ResourceItem, needles: string[]): boolean {
  return item.tags.some((t) => needles.some((n) => t.toLowerCase().includes(n.toLowerCase())));
}

function isChineseContent(item: ResourceItem): boolean {
  if (item.tags.some((t) => CN_CONTENT_TAGS.includes(t))) return true;
  // Summary explicitly focused on Chinese dramas
  const text = `${item.summary} ${item.summaryShort}`;
  return /国产|国内剧|华语剧|中剧/.test(text);
}

/**
 * Safe playlist criteria (transparent, based on the repo's own declared metadata):
 * 1. Exclude anything the repo itself flags as high copyright risk (all online streaming sites)
 * 2. Exclude subtitle/cloud-drive sites scoped to Chinese content
 * 3. Exclude Chinese drama / series content focus
 * 4. Keep only streaming-relevant categories
 */
export function buildSafePlaylist(includeTools: boolean) {
  const pool = items.filter(
    (i) =>
      i.risks.copyright !== "high" &&
      PLAYLIST_CATEGORIES.includes(i.category) &&
      !isChineseContent(i)
  );

  const declared = pool.filter((i) => i.risks.copyright === "low" || i.risks.copyright === "medium");
  const tools = pool.filter((i) => i.risks.copyright === "unknown");
  const list = includeTools ? [...declared, ...tools] : declared;

  function groupOf(item: ResourceItem): PlaylistGroupKey {
    if (item.category === "subscription" || hasTag(item, ["IPTV", "直播源"])) return "live";
    if (hasTag(item, ["追番", "番剧", "ACG", "动漫", "Bangumi"])) return "anime";
    if (
      item.category === "player" ||
      hasTag(item, ["TVBox", "影视仓", "FongMi", "CatVod", "播放器", "空壳"])
    ) {
      return "player";
    }
    if (item.category === "video_app" || hasTag(item, ["影视聚合", "客户端", "影音应用"])) return "app";
    return "tool";
  }

  const rank = (i: ResourceItem) =>
    (i.risks.copyright === "low" || i.risks.copyright === "medium" ? 0 : 1) * 10 +
    (i.availability?.status === "reachable" ? 0 : i.availability?.status === "restricted" ? 1 : 2);

  const groups = PLAYLIST_GROUPS.map((g) => ({
    ...g,
    items: list
      .filter((i) => groupOf(i) === g.key)
      .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "zh-Hans-CN")),
  })).filter((g) => g.items.length > 0);

  return {
    total: list.length,
    declaredCount: declared.length,
    toolsCount: tools.length,
    groups,
  };
}
