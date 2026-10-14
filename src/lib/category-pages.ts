/* Client-safe metadata for the dedicated category discovery pages.
   Taglines/blurbs/hues per iptv-org category id; art reuses the generated
   hero backdrops in /public/hero. No catalog import here. */

export interface CategoryPageMeta {
  tagline: string;
  blurb: string;
  hue: string; // tailwind gradient stops for the banner
  art?: string; // optional backdrop image
}

const META: Record<string, CategoryPageMeta> = {
  general: {
    tagline: "Everything, everywhere",
    blurb:
      "A mixed bag of general-interest channels covering news, entertainment and everyday television from around the world — the easiest place to channel-surf.",
    hue: "from-zinc-800 via-[#17171d] to-[#0b0819]",
  },
  news: {
    tagline: "The world, live",
    blurb:
      "Round-the-clock breaking news, market coverage and world affairs from broadcasters on every continent. When a story breaks, it breaks here first.",
    hue: "from-purple-950 via-[#1a1030] to-[#0b0819]",
    art: "/hero/hero-news.png",
  },
  religious: {
    tagline: "Faith & worship",
    blurb:
      "Services, devotionals, gospel music and faith-based teaching from channels of every tradition, streaming free and ungated.",
    hue: "from-amber-950 via-[#241a08] to-[#0b0819]",
  },
  entertainment: {
    tagline: "Pure entertainment",
    blurb:
      "Talk shows, variety formats, celebrity programming and general entertainment — the channels people leave on all day.",
    hue: "from-fuchsia-950 via-[#22102e] to-[#0b0819]",
  },
  music: {
    tagline: "Non-stop music",
    blurb:
      "Music video loops, live concerts and genre stations from the '80s to today. Press play and turn it up — no playlist required.",
    hue: "from-fuchsia-900 via-[#2a0f33] to-[#0b0819]",
    art: "/hero/hero-music.png",
  },
  movies: {
    tagline: "Cinema, un-gated",
    blurb:
      "Free-to-air movie channels running classics, cult favorites and mainstream cinema around the clock. Popcorn optional.",
    hue: "from-rose-950 via-[#241028] to-[#0b0819]",
  },
  series: {
    tagline: "Binge the serial world",
    blurb:
      "Drama, telenovelas, sitcoms and serialized storytelling — dedicated series channels streaming live, no subscription and no account.",
    hue: "from-pink-950 via-[#2b0f24] to-[#0b0819]",
  },
  sports: {
    tagline: "Live from the arena",
    blurb:
      "Match coverage, action sports and outdoor adventure from channels built for fans. The whistle never stops here.",
    hue: "from-violet-900 via-[#191233] to-[#0b0819]",
    art: "/hero/hero-sports.png",
  },
  kids: {
    tagline: "For the little ones",
    blurb:
      "Cartoons, educational shows and family-safe programming that parents can leave on without a second thought.",
    hue: "from-purple-900 via-[#1c1233] to-[#0b0819]",
  },
  animation: {
    tagline: "Anime & animated worlds",
    blurb:
      "Anime networks, classic cartoons and modern animation — drawn worlds that keep running twenty-four seven.",
    hue: "from-emerald-950 via-[#0b1f18] to-[#0b0819]",
  },
  legislative: {
    tagline: "Civic proceedings",
    blurb:
      "Parliaments, congresses and public-affairs sessions broadcast live — democracy, unedited.",
    hue: "from-zinc-900 via-[#131318] to-[#0b0819]",
  },
  education: {
    tagline: "Learn something new",
    blurb:
      "Lectures, language courses and skill-building channels that turn the television into a classroom.",
    hue: "from-teal-950 via-[#08201e] to-[#0b0819]",
  },
  culture: {
    tagline: "Arts & heritage",
    blurb:
      "Museums, performing arts and cultural programming from broadcasters preserving local heritage around the globe.",
    hue: "from-orange-950 via-[#26130a] to-[#0b0819]",
  },
  documentary: {
    tagline: "The world, in focus",
    blurb:
      "Nature, history, science and human stories — documentary channels for the endlessly curious.",
    hue: "from-violet-950 via-[#101028] to-[#0b0819]",
    art: "/hero/hero-docs.png",
  },
  comedy: {
    tagline: "Laugh out loud",
    blurb:
      "Sitcom reruns, stand-up specials and sketch-comedy channels stuck on a permanent laugh track.",
    hue: "from-yellow-950 via-[#25200c] to-[#0b0819]",
  },
  lifestyle: {
    tagline: "Living well",
    blurb:
      "Home, fashion, wellness and reality formats that make everyday life feel a little more aspirational.",
    hue: "from-rose-900 via-[#2a1020] to-[#0b0819]",
  },
  classic: {
    tagline: "Golden-age television",
    blurb:
      "Vintage series, retro cinema and nostalgia channels keeping broadcast history alive, one rerun at a time.",
    hue: "from-stone-900 via-[#1d1a16] to-[#0b0819]",
  },
  shop: {
    tagline: "Live retail",
    blurb:
      "Teleshopping and auction channels streaming deals around the clock — window shopping for the couch-bound.",
    hue: "from-lime-950 via-[#17200b] to-[#0b0819]",
  },
  outdoor: {
    tagline: "Into the wild",
    blurb:
      "Hunting, fishing, hiking and adventure channels for people who would rather be outside right now.",
    hue: "from-green-950 via-[#0a2010] to-[#0b0819]",
  },
  business: {
    tagline: "Markets & money",
    blurb:
      "Business news, market analysis and entrepreneurship from the world's financial broadcasters. The ticker never sleeps.",
    hue: "from-zinc-800 via-[#141419] to-[#0b0819]",
    art: "/hero/hero-city.png",
  },
  cooking: {
    tagline: "Kitchen television",
    blurb:
      "Cook-along shows, chef competitions and food trails covering every cuisine on the map.",
    hue: "from-red-950 via-[#2a0d0d] to-[#0b0819]",
    art: "/hero/hero-food.png",
  },
  travel: {
    tagline: "Departures everywhere",
    blurb:
      "Travel guides, destination documentaries and wanderlust programming for the permanently homesick-at-home.",
    hue: "from-teal-900 via-[#07231f] to-[#0b0819]",
  },
  family: {
    tagline: "Together time",
    blurb:
      "All-ages programming designed for watching as a family — game shows, movies and gentle comedy.",
    hue: "from-pink-900 via-[#2b1220] to-[#0b0819]",
  },
  public: {
    tagline: "Public broadcasting",
    blurb:
      "Publicly funded channels delivering news, culture and civic programming as a public service.",
    hue: "from-neutral-900 via-[#17171a] to-[#0b0819]",
  },
  auto: {
    tagline: "Motoring TV",
    blurb:
      "Car shows, motorsport coverage and everything else that happens on four wheels.",
    hue: "from-zinc-700 via-[#1c1c22] to-[#0b0819]",
  },
  weather: {
    tagline: "Forecast, always",
    blurb:
      "Live weather channels and radar loops for planners, pilots and storm watchers.",
    hue: "from-teal-950 via-[#0a1f22] to-[#0b0819]",
  },
  science: {
    tagline: "How the world works",
    blurb:
      "Science and discovery channels covering space, nature and the technology shaping tomorrow.",
    hue: "from-violet-950 via-[#0e1226] to-[#0b0819]",
  },
  relax: {
    tagline: "Slow television",
    blurb:
      "Ambient scenery, fireplace loops and calming visuals for background viewing while you do everything else.",
    hue: "from-green-900 via-[#0c2113] to-[#0b0819]",
  },
};

const FALLBACK: CategoryPageMeta = {
  tagline: "Live, free and open",
  blurb:
    "Live free-to-air channels in this category, indexed from the open iptv-org catalog and streamed straight to your browser.",
  hue: "from-violet-950 via-[#14102b] to-[#0b0819]",
};

export function categoryPageMeta(categoryId: string): CategoryPageMeta {
  return META[categoryId] ?? FALLBACK;
}
