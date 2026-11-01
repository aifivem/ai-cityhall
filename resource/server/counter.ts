import {
  aiLog,
  aiLogChannels,
  definitions,
  onClientCallback,
  resourceExport,
} from "@aicore-fivem/lib/server";
import { fail } from "@aicore-fivem/lib/shared";
import { EVENTS } from "common/hall";
import { atHall, content, oneText, twoTexts } from "./content";

/** The hall counter: what a hall offers and taking one of its jobs. */

const core = resourceExport("ai-core");
aiLogChannels({ cityhall: {} });

/** An offered job's label from ai-core's definitions (lib `definitions`); a job missing from ai-core is not offered. */
const label = (job: string): string | undefined => definitions.job(job)?.label;

onClientCallback(EVENTS.offer, { args: oneText }, (source, id) => {
  if (!atHall(source, id)) return fail("HALL_ERR_FAR");
  return {
    ok: true,
    jobs: content.settings.jobs.flatMap((j) => {
      const name = label(j.job);
      return name === undefined ? [] : [{ job: j.job, label: name }];
    }),
    documents: content.settings.documents,
  };
});

onClientCallback(
  EVENTS.takeJob,
  { args: twoTexts, lock: true },
  (source, id, job) => {
    if (!atHall(source, id)) return fail("HALL_ERR_FAR");
    const offer = content.settings.jobs.find((j) => j.job === job);
    if (!offer || label(job) === undefined) return fail("HALL_ERR_GONE");
    if (!core.SetJob(source, job, offer.grade)) return fail("HALL_ERR_JOB");
    aiLog("cityhall", `took the job ${job}`, { source, metadata: { job } });
    return { ok: true };
  },
);
