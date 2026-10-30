import {
  AdminPanel,
  aiLog,
  aiLogChannels,
  inventory,
  notify,
  onClientCallback,
  playersNear,
  resourceExport,
} from "@aicore-fivem/lib/server";
import { Locale } from "common";
import { EVENTS, readHalls, readSettings, type Hall } from "common/hall";
import { cityhallSchema } from "./schema";

const core = resourceExport("ai-core");
const panel = new AdminPanel(cityhallSchema);
/** Panel content, parsed again after every change. */
const content = {
  halls: readHalls(panel.get("halls")),
  settings: readSettings(panel.get("settings")),
};
panel.onChange("halls", () => (content.halls = readHalls(panel.get("halls"))));
panel.onChange(
  "settings",
  () => (content.settings = readSettings(panel.get("settings"))),
);
aiLogChannels({ cityhall: {} });

const fail = (error: string) => ({ ok: false as const, error });

function atHall(source: number, id: string): Hall | null {
  const hall = content.halls.get(id);
  if (!hall) return null;
  const [x = 0, y = 0, z = 0] = GetEntityCoords(GetPlayerPed(String(source)));
  return Math.hypot(x - hall.x, y - hall.y, z - hall.z) <= hall.radius + 2
    ? hall
    : null;
}

onClientCallback(
  EVENTS.offer,
  { args: ([id]) => (typeof id === "string" ? [id] : null) },
  (source, id) => {
    if (!atHall(source, id)) return fail("HALL_ERR_FAR");
    const defs = core.GetJobDefinitions();
    return {
      ok: true,
      jobs: content.settings.jobs
        .filter((j) => defs[j.job])
        .map((j) => ({ job: j.job, label: defs[j.job]?.label ?? j.job })),
      documents: content.settings.documents,
    };
  },
);

onClientCallback(
  EVENTS.takeJob,
  {
    args: ([id, job]) =>
      typeof id === "string" && typeof job === "string" ? [id, job] : null,
    lock: true,
  },
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
  {
    args: ([id, item]) =>
      typeof id === "string" && typeof item === "string" ? [id, item] : null,
    lock: true,
  },
  (source, id, item) => {
    if (!atHall(source, id)) return fail("HALL_ERR_FAR");
    const doc = content.settings.documents.find((d) => d.item === item);
    const character = core.GetCharacter(source);
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
const registerDocs = () => {
  for (const doc of content.settings.documents)
    inventory.registerUsableItem(doc.item, (source, item) =>
      showDocument(source, item),
    );
};
registerDocs();
