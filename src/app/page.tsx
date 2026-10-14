import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CollectionPanel } from "@/components/collection/collection-panel";
import { AppShell } from "@/components/stream/app-shell";
import { meta } from "@/lib/collection";
import {
  catalog,
  countByCategory,
} from "@/lib/stream.server";
import { heroItems, homeRows } from "@/lib/spotlight";
import {
  CheckCircle2,
  Database,
  Radio,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  const availabilityDate = meta.availabilityGeneratedAt.slice(0, 10);

  return (
    <AppShell
      hero={heroItems()}
      rows={homeRows()}
      categories={catalog.categories}
      countries={catalog.countries}
      catCounts={countByCategory()}
      total={catalog.meta.channels}
      countriesCount={catalog.meta.countries}
      generatedAt={catalog.meta.generatedAt.slice(0, 10)}
      sourceUrl={catalog.meta.sourceUrl}
      repoUrl={meta.repoUrl}
      collection={
        <section aria-label="Curated collection browser" className="flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
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
          <CollectionPanel />
        </section>
      }
      about={
        <AboutSection
          channels={catalog.meta.channels}
          generatedAt={catalog.meta.generatedAt.slice(0, 10)}
        />
      }
    />
  );
}

/* ---------- About & content policy (server-rendered) ---------- */

function AboutSection({
  channels,
  generatedAt,
}: {
  channels: number;
  generatedAt: string;
}) {
  return (
    <section aria-label="About and content policy" className="mx-auto max-w-3xl space-y-6 pb-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
          <ScrollText className="size-5 text-violet-400" />
          About OpenStream
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          OpenStream is a production transformation of the GitHub repository{" "}
          <a
            href={meta.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400/90 underline-offset-2 hover:underline"
          >
            laoma528/awesome-zhuiju-free
          </a>{" "}
          into a usable product. The repository tracks {meta.total} free movie
          and TV resources, but its own maintainer flags roughly 76% of them —
          every online streaming site — as high copyright risk. This app
          therefore streams only the safe subset: content from{" "}
          <a
            href={catalog.meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400/90 underline-offset-2 hover:underline"
          >
            iptv-org
          </a>
          , an open-source community index of publicly available free-to-air
          television channels, which the source repository itself declares as
          low copyright risk. The full curated index remains browsable in the
          Collection tab for research purposes.
        </p>
      </div>

      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
          <ShieldCheck className="size-5 text-emerald-400" />
          Content policy
        </h2>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed text-zinc-400">
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>
              <strong className="text-zinc-300">Only open, declared-safe sources.</strong>{" "}
              Channels come from the iptv-org index ({channels.toLocaleString()}{" "}
              playable entries as of {generatedAt}). No site flagged high or
              medium-high copyright risk by the source repository is included.
            </span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>
              <strong className="text-zinc-300">Browser-playable only.</strong> Only HTTPS
              HLS (.m3u8) streams that play natively in a browser are indexed —
              no stream requiring special headers, and NSFW channels and streams
              the iptv-org maintainers have blocked are excluded.
            </span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>
              <strong className="text-zinc-300">No login, no tracking, no ads.</strong>{" "}
              Favorites and watch history live only in your browser&apos;s local
              storage. There is no account system and no analytics.
            </span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>
              <strong className="text-zinc-300">No media hosting.</strong> This app is a
              player and directory. All streams are served by third parties;
              nothing is downloaded, stored, or re-hosted here.
            </span>
          </li>
        </ul>
      </div>

      <Separator className="bg-zinc-800" />

      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
          <Radio className="size-5 text-zinc-400" />
          Availability &amp; copyright notes
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Public free-to-air streams frequently go offline, throttle, or apply
          geo-restrictions. When a signal fails, the player offers retry,
          alternate source, and the direct stream link. &quot;Copyright-risk-free&quot;
          reflects the source repository&apos;s own declared labels plus
          iptv-org&apos;s public-index policy — it is not a legal guarantee, and
          broadcast rights differ by country. If you believe a stream indexed by
          iptv-org infringes your rights, report it via the{" "}
          <a
            href="https://github.com/iptv-org/iptv/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400/90 underline-offset-2 hover:underline"
          >
            iptv-org issue tracker
          </a>
          ; blocked entries disappear from this catalog on the next data rebuild.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-zinc-100">Credits</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          <a
            href={meta.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400/90 underline-offset-2 hover:underline"
          >
            awesome-zhuiju-free
          </a>{" "}
          ({meta.license}) — the curated index this product was built from ·{" "}
          <a
            href={catalog.meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400/90 underline-offset-2 hover:underline"
          >
            iptv-org
          </a>{" "}
          — channel &amp; stream data ·{" "}
          <a
            href="https://github.com/video-dev/hls.js"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400/90 underline-offset-2 hover:underline"
          >
            hls.js
          </a>{" "}
          — adaptive streaming playback · built with Next.js.
        </p>
      </div>
    </section>
  );
}
