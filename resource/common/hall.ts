import {
  bool,
  int,
  num,
  record,
  str,
  readPlacePed,
  type PlacePed,
} from "@aicore-fivem/lib/shared";

/** ai-cityhall's contracts and panel content. No natives. */

export const EVENTS = {
  /** Callback: (hallId) -> { ok, jobs, documents } what this city hall offers the player. */
  offer: "ai-cityhall:offer",
  /** Callback: (hallId, job) -> { ok } take a job from the job center. */
  takeJob: "ai-cityhall:takeJob",
  /** Callback: (hallId, item) -> { ok } buy a document. */
  buy: "ai-cityhall:buy",
} as const;

export interface Hall {
  /** NPC standing at the place (panel), null for none. */
  ped: PlacePed | null;
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  blip: boolean;
  blipStyle: { sprite: number; color: number; scale: number };
}

export interface Settings {
  /** Jobs anyone may take at the job center, at this grade. */
  jobs: Array<{ job: string; grade: number }>;
  documents: Array<{ item: string; price: number }>;
  accounts: string[];
}

/** One city hall record (`panel.records` / `world.records`). */
export function readHall(id: string, v: Record<string, unknown>): Hall {
  const c = record(v.coords);
  const style = record(v.blipStyle);
  return {
    ped: readPlacePed(v.ped),
    id,
    label: str(v.label, id, 48),
    x: num(c.x, 0),
    y: num(c.y, 0),
    z: num(c.z, 0),
    radius: num(v.radius, 2.5, 1, 20),
    blip: bool(v.blip, true),
    blipStyle: {
      sprite: int(style.sprite, 419, 0, 1000),
      color: int(style.color, 0, 0, 100),
      scale: num(style.scale, 0.7, 0.3, 2),
    },
  };
}

export function readSettings(raw: unknown): Settings {
  const s = record(raw);
  const rows = (v: unknown) => (Array.isArray(v) ? v.map(record) : []);
  const accounts = Array.isArray(s.accounts)
    ? s.accounts.filter((a): a is string => typeof a === "string")
    : [];
  return {
    jobs: rows(s.jobs).flatMap((r) =>
      typeof r.job === "string"
        ? [{ job: r.job, grade: int(r.grade, 0, 0, 50) }]
        : [],
    ),
    documents: rows(s.documents).flatMap((r) =>
      typeof r.item === "string"
        ? [{ item: r.item.toLowerCase(), price: int(r.price, 0, 0, 1_000_000) }]
        : [],
    ),
    accounts: accounts.length ? accounts : ["cash", "bank"],
  };
}
