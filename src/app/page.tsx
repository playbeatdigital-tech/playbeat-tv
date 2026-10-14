import { CollectionPanel } from "@/components/collection/collection-panel";
import { meta } from "@/lib/collection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Globe, Database } from "lucide-react";

export default function Home() {
  const availabilityDate = meta.availabilityGeneratedAt.slice(0, 10);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/95">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                  <Globe className="size-5" />
                </span>
                <div>
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                    追剧免费资源 — 影视合集预览
                  </h1>
                  <p className="text-sm text-zinc-500">
                    浏览{" "}
                    <a
                      href={meta.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 hover:text-amber-400"
                    >
                      awesome-zhuiju-free
                    </a>{" "}
                    精选索引 · 配套站点{" "}
                    <a
                      href={meta.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 hover:text-amber-400"
                    >
                      zhuiju.me
                    </a>
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400"
                >
                  {meta.total} 个资源
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400"
                >
                  {Object.keys(meta.categoryCounts).length} 个分类
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400"
                >
                  <Database className="size-3" />
                  清单更新 {meta.resourcesUpdatedAt}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400"
                >
                  可用性检测 {availabilityDate}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900/60 text-zinc-500"
                >
                  {meta.license}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <a
                href={meta.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="size-4" />
                GitHub 仓库
                <ExternalLink className="size-3" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <CollectionPanel />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
          <p className="text-xs leading-relaxed text-zinc-600">
            本页面是 GitHub 仓库{" "}
            <span className="font-mono text-zinc-500">{meta.repo}</span> 的数据快照（取自
            2026-10-14）。资源名称、简介与维护者备注均保留原始中文；可用性状态来自项目每日自动检测（
            {availabilityDate} 运行）。所列站点均为第三方资源，本面板仅索引元数据、不托管任何内容。多数条目被维护者标记为高版权风险，实际可用性因地区与网络环境而异。
          </p>
        </div>
      </footer>
    </div>
  );
}
