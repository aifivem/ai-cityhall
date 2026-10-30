import {
  AdminPanel,
  aiLog,
  aiLogChannels,
  inventory,
  isNear,
  notify,
  onClientCallback,
  online,
  playersNear,
  resourceExport,
} from "@aicore-fivem/lib/server";
import { fail, oneArg, readText } from "@aicore-fivem/lib/shared";
import { Locale } from "common";
import { EVENTS, readHall, readSettings, type Hall } from "common/hall";
import { cityhallSchema } from "./schema";

const core = resourceExport("ai-core");
const panel = new AdminPanel(cityhallSchema);
const settings = panel.view("settings", readSettings);
const content = {
  halls: panel.records("halls", readHall),
  get settings() {
    return settings.value;
  },
};
aiLogChannels({ cityhall: {} });

function atHall(source: number, id: string): Hall | null {
  const hall = content.halls.get(id);
  return hall && isNear(source, hall, hall.radius + 2) ? hall : null;
}

const text = (v: unknown) => readText(v, 64);
const twoTexts = ([a, b]: unknown[]): [string, string] | null => {
  const x = text(a);
  const y = text(b);
  return x !== null && y !== null ? [x, y] : null;
};

onClientCallback(EVENTS.offer, { args: oneArg(text) }, (source, id) => {
  if (!atHall(source, id)) return fail("HALL_ERR_FAR");
  const defs = core.GetJobDefinitions();
  return {
    ok: true,
    jobs: content.settings.jobs
      .filter((j) => defs[j.job])
      .map((j) => ({ job: j.job, label: defs[j.job]?.label ?? j.job })),
    documents: content.settings.documents,
  };
});

onClientCallback(
  EVENTS.takeJob,
  { args: twoTexts, lock: true },
  (source, id, job) => {
    if (!atHall(source, id)) return fail("HALL_ERR_FAR");
    const offer = content.settings.jobs.find((j) => j.job === job);
    if (!offer || !core.GetJobDefinitions()[job]) return fail("HALL_ERR_GONE");
    if (!core.SetJob(source, job, offer.grade)) return fail("HALL_ERR_JOB");
    aiLog("cityhall", `took the job ${job}`, { source, metadata: { job } });
    return { ok: true };
  },
);

onClientCallback(
  EVENTS.buy,
  { args: twoTexts, lock: true },
  (source, id, item) => {
    if (!atHall(source, id)) return fail("HALL_ERR_FAR");
    const doc = content.settings.documents.find((d) => d.item === item);
    const character = online.character(source);
    if (!doc || !character) return fail("HALL_ERR_GONE");
    const metadata = {
      name: `${character.firstname} ${character.lastname}`,
      birthdate: character.birthdate,
      citizenid: character.citizenid,
      sex: character.sex,
    };
    if (!inventory.canCarryItem(source, item, 1, metadata))
      return fail("HALL_ERR_SPACE");
    if (
      doc.price > 0 &&
      !content.settings.accounts.some((a) =>
        core.RemoveMoney(source, a, doc.price, `cityhall:${item}`),
      )
    )
      return fail("HALL_ERR_MONEY");
    inventory.addItem(source, item, 1, metadata);
    return { ok: true };
  },
);

/** Showing a document: everyone within 3 m (and the holder) gets the card's details. */
function showDocument(
  source: number,
  item: { name: string; metadata: Record<string, unknown> },
): boolean {
  // A document removed from the panel does nothing (usable items stay registered until a restart).
  if (!content.settings.documents.some((d) => d.item === item.name))
    return false;
  const m = item.metadata;
  const text = Locale(
    "HALL_SHOW",
    String(m.name ?? "?"),
    String(m.birthdate ?? "?"),
    String(m.citizenid ?? "?"),
  );
  for (const target of playersNear(source, 3))
    notify(target, text, "info", 8000);
  // Documents are kept when shown.
  return false;
}
/** Registers every panel document as usable, once per item name: a document added in the panel works at once. */
const registered = new Set<string>();
const registerDocs = () => {
  for (const doc of content.settings.documents) {
    if (registered.has(doc.item)) continue;
    registered.add(doc.item);
    inventory.registerUsableItem(doc.item, (source, item) =>
      showDocument(source, item),
    );
  }
};
registerDocs();
panel.onChange("settings", registerDocs);
