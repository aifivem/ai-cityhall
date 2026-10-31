import { AdminPanel, isNear } from "@aicore-fivem/lib/server";
import { readText } from "@aicore-fivem/lib/shared";
import { readHall, readSettings, type Hall } from "common/hall";
import { cityhallSchema } from "./schema";

export const panel = new AdminPanel(cityhallSchema);
const settings = panel.view("settings", readSettings);
/** Panel content, kept current by the panel's views. */
export const content = {
  halls: panel.records("halls", readHall),
  get settings() {
    return settings.value;
  },
};

/** The hall a player stands at, or null. */
export function atHall(source: number, id: string): Hall | null {
  const hall = content.halls.get(id);
  return hall && isNear(source, hall, hall.radius + 2) ? hall : null;
}

const text = (v: unknown) => readText(v, 64);
/** Callback args (hallId, key). */
export const twoTexts = ([a, b]: unknown[]): [string, string] | null => {
  const x = text(a);
  const y = text(b);
  return x !== null && y !== null ? [x, y] : null;
};
export const oneText = ([a]: unknown[]): [string] | null => {
  const x = text(a);
  return x === null ? null : [x];
};
