import type { PanelSchema } from "@aicore-fivem/shared";
import { hallsFile, hallsTab } from "./halls";
import { settingsFile, settingsTab } from "./settings";

/** ai-cityhall's panel: city halls, jobs anyone may take, documents for sale. */
export const cityhallSchema: PanelSchema = {
  title: "ADMIN_TITLE",
  icon: "id-card",
  files: {
    halls: hallsFile,
    settings: settingsFile,
  },
  tabs: [hallsTab, settingsTab],
};
