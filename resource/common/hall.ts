import { bool, int, num, record, str } from "@aicore-fivem/lib/shared";

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
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  blip: boolean;
}

export interface Settings {
  /** Jobs anyone may take at the job center, at this grade. */
  jobs: Array<{ job: string; grade: number }>;
  documents: Array<{ item: string; price: number }>;
  accounts: string[];
}

export function readHalls(raw: unknown): Map<string, Hall> {
  const out = new Map<string, Hall>();
  for (const [id, value] of Object.entries(record(raw))) {
    const v = record(value);
    const c = record(v.coords);
    out.set(id, {
      id,
      label: str(v.label, id, 48),
      x: num(c.x, 0),
      y: num(c.y, 0),
      z: num(c.z, 0),
      radius: num(v.radius, 2.5, 1, 20),
      blip: bool(v.blip, true),
    });
  }
  return out;
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
