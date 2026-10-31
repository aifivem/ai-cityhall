import {
  bool,
  int,
  num,
  type PlacePed,
  readBlipStyle,
  readPlacePed,
  record,
  str,
} from "@aicore-fivem/lib/shared";

/** ai-cityhall's contracts and panel content. No natives. */

export const EVENTS = {
  /** Callback: (hallId) -> { ok, jobs, documents } what this city hall offers the player. */
  offer: "ai-cityhall:offer",
  /** Callback: (hallId, job) -> { ok } take a job from the job center. */
  takeJob: "ai-cityhall:takeJob",
  /** Callback: (hallId, item) -> { ok } buy a document. */
  buy: "ai-cityhall:buy",
  /** Server -> each player near a shown document: (card: IdCard) show it on screen. */
  showCard: "ai-cityhall:client:showCard",
  /** Server -> the player showing a document: () play the showing animation. */
  showing: "ai-cityhall:client:showing",
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
  /** Seconds a shown document stays on screen. */
  cardSeconds: number;
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
    blipStyle: readBlipStyle(style, { sprite: 419, color: 0, scale: 0.7 }),
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
    cardSeconds: int(s.cardSeconds, 8, 2, 60),
  };
}

/** A document as its viewers get it: the holder written on the item when it was bought (qbx_idcard's fields). */
export interface IdCard {
  item: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  sex: "male" | "female" | "";
  nationality: string;
  citizenid: string;
  /** Server id of the player showing the card when it is their own (their face is the photo); null otherwise. */
  holder: number | null;
  seconds: number;
}

/** A document item's metadata (older items carry only `name`) or a server payload, read into a card. */
export function toIdCard(
  item: string,
  v: Record<string, unknown>,
  holder: number | null,
  seconds: number,
): IdCard {
  const name = str(v.name, "", 64);
  const space = name.indexOf(" ");
  const sex = v.sex === "male" || v.sex === "female" ? v.sex : "";
  return {
    item: str(item, "", 48),
    firstname: str(v.firstname, space > 0 ? name.slice(0, space) : name, 32),
    lastname: str(v.lastname, space > 0 ? name.slice(space + 1) : "", 32),
    birthdate: str(v.birthdate, "", 16),
    sex,
    nationality: str(v.nationality, "", 32),
    citizenid: str(v.citizenid, "", 16),
    holder,
    seconds: int(seconds, 8, 2, 60),
  };
}
