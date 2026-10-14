/* Client-safe stream helpers — NO static JSON import here.
   The heavy catalog is injected via props (server) or fetched from /api/catalog (client).
   Server-side access lives in lib/stream.server.ts. */

/* ---------- types ---------- */

export interface StreamSource {
  u: string;
  q: number; // numeric quality (0 = unknown)
}

export interface StreamChannel {
  id: string;
  name: string;
  country: string;
  flag: string;
  cats: string[];
  logo: string;
  srcs: StreamSource[];
}

export interface CountryMeta {
  code: string;
  name: string;
  flag: string;
}

export interface CategoryMeta {
  id: string;
  name: string;
}

export interface StreamCatalog {
  meta: {
    generatedAt: string;
    source: string;
    sourceUrl: string;
    api: string;
    criteria: string[];
    channels: number;
    countries: number;
    categories: number;
  };
  countries: CountryMeta[];
  categories: CategoryMeta[];
  channels: StreamChannel[];
}

/* ---------- pure helpers ---------- */

export function qualityLabel(ch: StreamChannel): string {
  const q = ch.srcs[0]?.q ?? 0;
  if (q >= 1080) return "1080p";
  if (q >= 720) return "HD";
  if (q >= 480) return "480p";
  if (q > 0) return `${q}p`;
  return "SD";
}

export interface ChannelQuery {
  q?: string;
  category?: string; // category id or "all"
  country?: string; // country code or "all"
  ids?: string[]; // explicit id list (favorites / recents)
}

export function filterChannels(
  channels: StreamChannel[],
  query: ChannelQuery
): StreamChannel[] {
  const q = query.q?.trim().toLowerCase() ?? "";
  const idSet = query.ids ? new Set(query.ids) : null;
  return channels.filter((c) => {
    if (idSet && !idSet.has(c.id)) return false;
    if (query.category && query.category !== "all" && !c.cats.includes(query.category))
      return false;
    if (query.country && query.country !== "all" && c.country !== query.country)
      return false;
    if (q && !c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q))
      return false;
    return true;
  });
}

/* ---------- favorites / recents (localStorage-backed external store) ----------
   Implemented as a tiny external store so components can consume it via
   useSyncExternalStore — no setState-in-effect hydration patterns. */

const FAV_KEY = "playbeat:favorites";
const RECENT_KEY = "playbeat:recents";
/* Pre-rebrand keys — migrated once so returning visitors keep their list. */
const LEGACY_FAV_KEY = "openstream:favorites";
const LEGACY_RECENT_KEY = "openstream:recents";
const MAX_RECENTS = 12;

export interface RecentEntry {
  id: string;
  at: number;
}

type Listener = () => void;

function createStore<T>(key: string, initial: T) {
  let cache: T = initial;
  let hydrated = false;
  const listeners = new Set<Listener>();

  function hydrate() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      let raw = window.localStorage.getItem(key);
      if (!raw) {
        const legacyKey = key === FAV_KEY ? LEGACY_FAV_KEY : LEGACY_RECENT_KEY;
        const legacy = window.localStorage.getItem(legacyKey);
        if (legacy) {
          raw = legacy;
          try {
            window.localStorage.setItem(key, legacy);
            window.localStorage.removeItem(legacyKey);
          } catch {
            /* migration is best-effort */
          }
        }
      }
      if (raw) cache = JSON.parse(raw) as T;
    } catch {
      /* keep initial */
    }
  }

  return {
    subscribe(cb: Listener): () => void {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    get(): T {
      hydrate();
      return cache;
    },
    set(next: T) {
      cache = next;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      listeners.forEach((l) => l());
    },
  };
}

export const favoritesStore = createStore<string[]>(FAV_KEY, []);
export const recentsStore = createStore<RecentEntry[]>(RECENT_KEY, []);

const EMPTY_FAVORITES: string[] = [];
const EMPTY_RECENTS: RecentEntry[] = [];

export function getFavoritesSnapshot(): string[] {
  return favoritesStore.get();
}

export function getFavoritesServerSnapshot(): string[] {
  return EMPTY_FAVORITES;
}

export function subscribeFavorites(cb: Listener): () => void {
  return favoritesStore.subscribe(cb);
}

export function toggleFavorite(id: string): void {
  const cur = favoritesStore.get();
  favoritesStore.set(cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]);
}

export function getRecentsSnapshot(): RecentEntry[] {
  return recentsStore.get();
}

export function getRecentsServerSnapshot(): RecentEntry[] {
  return EMPTY_RECENTS;
}

export function subscribeRecents(cb: Listener): () => void {
  return recentsStore.subscribe(cb);
}

export function pushRecent(id: string): void {
  const cur = recentsStore.get().filter((r) => r.id !== id);
  recentsStore.set([{ id, at: Date.now() }, ...cur].slice(0, MAX_RECENTS));
}
