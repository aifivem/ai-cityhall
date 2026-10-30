import {
  AdminWorld,
  loadLocaleTexts,
  menu,
  notify,
  Points,
  triggerServerCallback,
} from "@aicore-fivem/lib/client";
import { record } from "@aicore-fivem/lib/shared";
import { Locale } from "common";
import { EVENTS, readHalls } from "common/hall";

const world = new AdminWorld(["halls"]);
const texts = loadLocaleTexts();
const errorText = (v: unknown, fallback: string): string => {
  const key =
    typeof record(v).error === "string" ? String(record(v).error) : fallback;
  return texts[key] ?? key;
};

/** City hall: ai-core's menu with the job center and the documents (labels from this script's lang file). */
async function openHall(id: string): Promise<void> {
  const offer = record(
    await triggerServerCallback(EVENTS.offer, [id]).catch(() => null),
  );
  if (offer.ok !== true)
    return notify(errorText(offer, "HALL_ERR_FAR"), "error");
  const jobs = Array.isArray(offer.jobs)
    ? offer.jobs.map(record).filter((j) => typeof j.job === "string")
    : [];
  const docs = Array.isArray(offer.documents)
    ? offer.documents.map(record).filter((d) => typeof d.item === "string")
    : [];
  const picked = await menu({
    title: Locale("HALL_TITLE"),
    items: [
      ...jobs.map((j) => ({
        id: `job:${String(j.job)}`,
        label: Locale("HALL_TAKE_JOB", String(j.label ?? j.job)),
        icon: "briefcase",
      })),
      ...docs.map((d) => ({
        id: `doc:${String(d.item)}`,
        label: Locale(
          "HALL_BUY_DOC",
          texts[`HALL_DOC_${String(d.item).toUpperCase()}`] ?? String(d.item),
          Number(d.price ?? 0),
        ),
        icon: "id-card",
      })),
    ],
  });
  if (!picked) return;
  const [kind, key] = [picked.slice(0, 3), picked.slice(4)];
  const result = record(
    await triggerServerCallback(kind === "job" ? EVENTS.takeJob : EVENTS.buy, [
      id,
      key,
    ]).catch(() => null),
  );
  if (result.ok === true)
    notify(
      Locale(kind === "job" ? "HALL_JOB_DONE" : "HALL_DOC_DONE"),
      "success",
    );
  else notify(errorText(result, "HALL_ERR_GONE"), "error");
}

const points = new Points();
function rebuild(): void {
  points.clear();
  for (const hall of readHalls(world.get("halls")).values()) {
    points.add(`hall:${hall.id}`, {
      ped: hall.ped ?? undefined,
      coords: hall,
      label: Locale("HALL_PROMPT", hall.label),
      icon: "landmark",
      radius: hall.radius,
      blip: hall.blip
        ? { sprite: 419, color: 0, scale: 0.7, label: hall.label }
        : undefined,
      onPressed: () => openHall(hall.id),
    });
  }
}
rebuild();
world.onChange("halls", rebuild);
