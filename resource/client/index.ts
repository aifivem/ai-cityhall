import { AdminWorld, hidePrompt, loadLocaleTexts, menu, notify, onPromptPressed, showPrompt, triggerServerCallback, Zones } from "@aicore-fivem/lib/client";
import { record } from "@aicore-fivem/lib/shared";
import { Locale } from "common";
import { EVENTS, readHalls } from "common/hall";

const world = new AdminWorld(["halls"]);
const texts = loadLocaleTexts();
const BLIP_TEXT = "AIHALL_BLIP";
AddTextEntry(BLIP_TEXT, "~a~");
const errorText = (v: unknown, fallback: string): string => {
  const key = typeof record(v).error === "string" ? String(record(v).error) : fallback;
  return texts[key] ?? key;
};

/** City hall: ai-core's menu with the job center and the documents (item labels from ai-inventory's item list). */
async function openHall(id: string): Promise<void> {
  const offer = record(await triggerServerCallback(EVENTS.offer, [id]).catch(() => null));
  if (offer.ok !== true) return notify(errorText(offer, "HALL_ERR_FAR"), "error");
  const jobs = Array.isArray(offer.jobs) ? offer.jobs.map(record).filter((j) => typeof j.job === "string") : [];
  const docs = Array.isArray(offer.documents) ? offer.documents.map(record).filter((d) => typeof d.item === "string") : [];
  const picked = await menu({
    title: Locale("HALL_TITLE"),
    items: [
      ...jobs.map((j) => ({ id: `job:${String(j.job)}`, label: Locale("HALL_TAKE_JOB", String(j.label ?? j.job)), icon: "briefcase" })),
      ...docs.map((d) => ({ id: `doc:${String(d.item)}`, label: Locale("HALL_BUY_DOC", texts[`HALL_DOC_${String(d.item).toUpperCase()}`] ?? String(d.item), Number(d.price ?? 0)), icon: "id-card" })),
    ],
  });
  if (!picked) return;
  const [kind, key] = [picked.slice(0, 3), picked.slice(4)];
  const result = record(await triggerServerCallback(kind === "job" ? EVENTS.takeJob : EVENTS.buy, [id, key]).catch(() => null));
  if (result.ok === true) notify(Locale(kind === "job" ? "HALL_JOB_DONE" : "HALL_DOC_DONE"), "success");
  else notify(errorText(result, "HALL_ERR_GONE"), "error");
}

const zones = new Zones();
let blips: number[] = [];
function rebuild(): void {
  zones.clear();
  for (const blip of blips) RemoveBlip(blip);
  blips = [];
  for (const hall of readHalls(world.get("halls")).values()) {
    const id = `hall:${hall.id}`;
    zones.add(id, { shape: { type: "sphere", center: hall, radius: hall.radius }, interval: 500, onEnter: () => showPrompt(id, Locale("HALL_PROMPT", hall.label)), onExit: () => hidePrompt(id) });
    if (!hall.blip) continue;
    const blip = AddBlipForCoord(hall.x, hall.y, hall.z);
    SetBlipSprite(blip, 419);
    SetBlipColour(blip, 0);
    SetBlipScale(blip, 0.7);
    SetBlipAsShortRange(blip, true);
    BeginTextCommandSetBlipName(BLIP_TEXT);
    AddTextComponentSubstringPlayerName(hall.label);
    EndTextCommandSetBlipName(blip);
    blips.push(blip);
  }
}
rebuild();
world.onChange("halls", rebuild);
onPromptPressed((id) => {
  if (id.startsWith("hall:")) void openHall(id.slice(5));
});
