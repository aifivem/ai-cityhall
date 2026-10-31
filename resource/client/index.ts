import "./card";
import {
  AdminWorld,
  callAction,
  loadLocaleTexts,
  menu,
  notify,
  Points,
} from "@aicore-fivem/lib/client";
import { record, RecordObjects } from "@aicore-fivem/lib/shared";
import { Locale } from "common";
import { EVENTS, readHall } from "common/hall";

const world = new AdminWorld(["halls"]);
const texts = loadLocaleTexts();

/** City hall: ai-core's menu with the job center and the documents (labels from this script's lang file). */
async function openHall(id: string): Promise<void> {
  const offer = await callAction(EVENTS.offer, [id], {
    fallback: "HALL_ERR_FAR",
  });
  if (!offer) return;
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
  const done = await callAction(
    kind === "job" ? EVENTS.takeJob : EVENTS.buy,
    [id, key],
    { fallback: "HALL_ERR_GONE" },
  );
  if (done)
    notify(
      Locale(kind === "job" ? "HALL_JOB_DONE" : "HALL_DOC_DONE"),
      "success",
    );
}

const points = new Points();
/** One point per hall; an edited hall rebuilds only its own point. */
new RecordObjects(world, "halls", readHall, (id, hall) => {
  points.add(`hall:${id}`, {
    ped: hall.ped ?? undefined,
    coords: hall,
    label: Locale("HALL_PROMPT", hall.label),
    icon: "landmark",
    radius: hall.radius,
    blip: hall.blip ? { ...hall.blipStyle, label: hall.label } : undefined,
    onPressed: () => openHall(id),
  });
  return () => points.remove(`hall:${id}`);
});
