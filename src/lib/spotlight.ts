/* Server-only: curated homepage content (hero spotlight + rails).
   Imports the bundled catalog via lib/stream.server — never import from client code. */
import type { StreamChannel } from "@/lib/stream";
import { catalog, channelById } from "@/lib/stream.server";

export interface HeroItem {
  channel: StreamChannel;
  backdrop: string;
  tagline: string;
  description: string;
}

export interface HomeRow {
  id: string;
  title: string;
  subtitle: string;
  variant: "poster" | "wide";
  hue: string; // tailwind gradient stops for the poster tile
  category?: string; // category preset for the "Explore" link
  channels: StreamChannel[];
}

/* ---------- hero spotlight: six hand-picked, multi-source, high-quality channels ---------- */

interface HeroDef {
  id: string;
  backdrop: string;
  tagline: string;
  description: string;
}

const HERO_DEFS: HeroDef[] = [
  {
    id: "BloombergTV.us",
    backdrop: "/hero/hero-city.png",
    tagline: "Where the markets never sleep",
    description:
      "Global business and finance, live around the clock. Markets, economies and the deals that move them — streamed free from the public free-to-air index, no account required.",
  },
  {
    id: "France24.fr",
    backdrop: "/hero/hero-news.png",
    tagline: "The world in live broadcast",
    description:
      "Round-the-clock international news from Paris. Breaking stories, live events and in-depth coverage from every continent — free to watch, straight in your browser.",
  },
  {
    id: "RedBullTV.at",
    backdrop: "/hero/hero-sports.png",
    tagline: "Adventure in motion",
    description:
      "Action sports, live global events and original storytelling. From cliff diving to freeride lines — the adrenaline side of live television, available without a subscription.",
  },
  {
    id: "AlJazeeraDocumentary.qa",
    backdrop: "/hero/hero-docs.png",
    tagline: "The planet, in focus",
    description:
      "Award-winning documentary programming exploring nature, science and human stories. A front-row seat to the world — open, ungated and free to stream.",
  },
  {
    id: "Vevo80s.us",
    backdrop: "/hero/hero-music.png",
    tagline: "Neon never died",
    description:
      "Iconic music videos from the decade of synth and chrome, non-stop and in HD. The ultimate retro video station — press play and time-travel.",
  },
  {
    id: "Tastemade.us",
    backdrop: "/hero/hero-food.png",
    tagline: "Taste the world",
    description:
      "Binge-worthy food, travel and lifestyle series from creators everywhere. From street food to fine dining — delicious television, always free.",
  },
];

export function heroItems(): HeroItem[] {
  return HERO_DEFS.flatMap((def) => {
    const channel = channelById(def.id);
    return channel ? [{ channel, ...def }] : [];
  });
}

/* ---------- trending rail: curated brand channels, verified multi-source ---------- */

const TRENDING_IDS = [
  "BloombergTV.us",
  "RedBullTV.at",
  "France24.fr",
  "AlJazeera.qa",
  "ABCNewsLive.us",
  "NBCNewsNOW.us",
  "TRTWorld.tr",
  "CBSNews247.us",
  "AlJazeeraDocumentary.qa",
  "Vevo80s.us",
  "Vevo2K.us",
  "Tastemade.us",
  "NickelodeonLatinAmerica.us",
  "EuronewsEnglish.fr",
  "BloombergOriginals.us",
  "CNAOriginals.sg",
];

function byIds(ids: string[]): StreamChannel[] {
  return ids
    .map((id) => channelById(id))
    .filter((c): c is StreamChannel => !!c);
}

/* ---------- quality rails from the full catalog ---------- */

function rank(c: StreamChannel): number {
  return (c.srcs[0]?.q ?? 0) * 10 + c.srcs.length;
}

function topByCategory(cat: string, n: number): StreamChannel[] {
  return catalog.channels
    .filter((c) => c.cats.includes(cat) && c.logo && (c.srcs[0]?.q ?? 0) >= 720)
    .sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name))
    .slice(0, n);
}

function topOverall(n: number): StreamChannel[] {
  return catalog.channels
    .filter((c) => c.logo && (c.srcs[0]?.q ?? 0) >= 1080 && c.srcs.length >= 2)
    .sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name))
    .slice(0, n);
}

export function homeRows(): HomeRow[] {
  const rows: HomeRow[] = [
    {
      id: "trending",
      title: "Trending Across the Globe",
      subtitle: "The most-watched live channels this week.",
      variant: "poster",
      hue: "from-violet-950 via-[#14102b] to-[#0b0819]",
      channels: byIds(TRENDING_IDS),
    },
    {
      id: "news",
      title: "News Around the Clock",
      subtitle: "Breaking stories and world events, live.",
      variant: "poster",
      hue: "from-purple-950 via-[#1a1030] to-[#0b0819]",
      category: "news",
      channels: topByCategory("news", 14),
    },
    {
      id: "music",
      title: "Music & Concerts",
      subtitle: "Non-stop music videos and live sessions.",
      variant: "poster",
      hue: "from-fuchsia-950 via-[#22102e] to-[#0b0819]",
      category: "music",
      channels: topByCategory("music", 14),
    },
    {
      id: "sports",
      title: "Sports Arena",
      subtitle: "Live games, adrenaline and outdoor action.",
      variant: "wide",
      hue: "from-violet-900 via-[#191233] to-[#0b0819]",
      category: "sports",
      channels: topByCategory("sports", 14),
    },
    {
      id: "movies",
      title: "Movies & Series",
      subtitle: "Free-to-air cinema and serialized stories.",
      variant: "wide",
      hue: "from-rose-950 via-[#241028] to-[#0b0819]",
      category: "movies",
      channels: topByCategory("movies", 14),
    },
    {
      id: "kids",
      title: "Kids & Animation",
      subtitle: "Cartoons and family-friendly fun, all day.",
      variant: "wide",
      hue: "from-purple-900 via-[#1c1233] to-[#0b0819]",
      category: "kids",
      channels: topByCategory("kids", 14),
    },
    {
      id: "docs",
      title: "Documentary & Science",
      subtitle: "Explore the planet, one story at a time.",
      variant: "wide",
      hue: "from-violet-950 via-[#101028] to-[#0b0819]",
      category: "documentary",
      channels: topByCategory("documentary", 14),
    },
  ];

  const picks = topOverall(14);
  if (picks.length >= 6) {
    rows.push({
      id: "masterpieces",
      title: "Crystal-Clear Masterpieces",
      subtitle: "Hand-picked channels streaming in the highest quality.",
      variant: "wide",
      hue: "from-fuchsia-950 via-[#1b0f2e] to-[#0b0819]",
      channels: picks,
    });
  }
  return rows.filter((r) => r.channels.length >= 4);
}
