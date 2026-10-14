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
                    Awesome Zhuiju Free — Movie Collection Preview
                  </h1>
                  <p className="text-sm text-zinc-500">
                    Browsable preview of the{" "}
                    <a
                      href={meta.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 hover:text-amber-400"
                    >
                      awesome-zhuiju-free
                    </a>{" "}
                    curated index · companion site{" "}
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
                  {meta.total} resources
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400"
                >
                  {Object.keys(meta.categoryCounts).length} categories
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400"
                >
                  <Database className="size-3" />
                  List updated {meta.resourcesUpdatedAt}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900/60 font-mono text-zinc-400"
                >
                  Availability checked {availabilityDate}
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
                GitHub repo
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
            This page is a data snapshot of the GitHub repository{" "}
            <span className="font-mono text-zinc-500">{meta.repo}</span> (taken 2026-10-14),
            with all descriptions translated into English from the original Chinese. Availability
            statuses come from the project's daily automated check (run on {availabilityDate}).
            All listed sites are third-party resources; this panel only indexes metadata and
            hosts no content. Most entries are flagged by the maintainer as high copyright risk,
            and actual availability varies by region and network.
          </p>
        </div>
      </footer>
    </div>
  );
}
