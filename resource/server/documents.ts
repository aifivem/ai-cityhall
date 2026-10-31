import {
  inventory,
  onClientCallback,
  online,
  playersNear,
  resourceExport,
} from "@aicore-fivem/lib/server";
import { fail } from "@aicore-fivem/lib/shared";
import { EVENTS, toIdCard } from "common/hall";
import { atHall, content, panel, twoTexts } from "./content";

/** Documents (qbx_idcard): bought at a hall with the holder on the item, shown to the players around when used. */

const core = resourceExport("ai-core");

/** Documents show to players within this distance of the player using the document (the player included). */
const SHOW_METRES = 3;

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
      firstname: character.firstname,
      lastname: character.lastname,
      birthdate: character.birthdate,
      sex: character.sex,
      nationality: character.nationality,
      citizenid: character.citizenid,
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

/** Shows a document to every player within 3 m and the holder; the photo is the holder's face when it is their card. */
function showDocument(
  source: number,
  item: { name: string; metadata: Record<string, unknown> },
): boolean {
  // A document removed from the panel does nothing (usable items stay registered until a restart).
  if (!content.settings.documents.some((d) => d.item === item.name))
    return false;
  const own = item.metadata.citizenid === online.character(source)?.citizenid;
  const card = toIdCard(
    item.name,
    item.metadata,
    own ? source : null,
    content.settings.cardSeconds,
  );
  for (const target of playersNear(source, SHOW_METRES))
    emitNet(EVENTS.showCard, target, card);
  emitNet(EVENTS.showing, source);
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
