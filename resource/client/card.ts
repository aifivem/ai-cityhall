import {
  cache,
  loadLocaleTexts,
  onServerEvent,
  pedHeadshot,
  player,
  requestModel,
} from "@aicore-fivem/lib/client";
import { readId, readInt, record } from "@aicore-fivem/lib/shared";
import { ResourceName } from "common";
import { EVENTS, toIdCard, type IdCard } from "common/hall";
import type { NuiMessage } from "common/nui";

const send = (message: NuiMessage): void => SendNUIMessage(message);

/** qbx_idcard's showing animation and card prop (local: only the holder's client may create it). */
const SHOW_ANIM = { dict: "paper_1_rcm_alt1-9", clip: "player_one_dual-9" };
const SHOW_PROP = "prop_franklin_dl";
const SHOW_MS = 3500;

/**
 * A shown document as a card on this player's screen, without focus: it leaves by itself after the panel's time.
 * The photo is a headshot of the holder's ped (when it is their own card), released when the card goes.
 */
class CardScreen {
  private texts: Record<string, string> | null = null;
  private shown = 0;
  private headshot = 0;

  async show(card: IdCard): Promise<void> {
    const id = ++this.shown;
    if (!this.texts) {
      this.texts = loadLocaleTexts();
      send({ action: "texts", data: this.texts });
    }
    const shot = await this.photo(card.holder);
    if (id !== this.shown) {
      if (shot) UnregisterPedheadshot(shot.handle);
      return;
    }
    this.release();
    this.headshot = shot?.handle ?? 0;
    const t = this.texts;
    const ms = card.seconds * 1000;
    send({
      action: "show",
      data: {
        id,
        title: t[`HALL_DOC_${card.item.toUpperCase()}`] ?? card.item,
        firstname: card.firstname,
        lastname: card.lastname,
        birthdate: card.birthdate,
        sex: card.sex ? (t[`HALL_CARD_${card.sex.toUpperCase()}`] ?? "") : "",
        nationality: card.nationality,
        citizenid: card.citizenid,
        photo: shot ? `https://nui-img/${shot.txd}/${shot.txd}` : null,
        ms,
      },
    });
    setTimeout(() => {
      if (id === this.shown) this.release();
    }, ms + 500);
  }

  stop(): void {
    this.shown++;
    this.release();
    send({ action: "hide", data: null });
  }

  private photo(holder: number | null) {
    if (holder === null) return Promise.resolve(null);
    const ped =
      holder === cache.serverId
        ? cache.ped
        : GetPlayerPed(GetPlayerFromServerId(holder));
    return ped ? pedHeadshot(ped, false, 2000) : Promise.resolve(null);
  }

  private release(): void {
    if (this.headshot) UnregisterPedheadshot(this.headshot);
    this.headshot = 0;
  }
}

/** The holder's own part: the card in the hand for a moment. */
async function playShowing(): Promise<void> {
  const model = await requestModel(SHOW_PROP).catch(() => 0);
  const ped = cache.ped;
  let prop = 0;
  if (model) {
    const [x = 0, y = 0, z = 0] = GetEntityCoords(ped, false);
    prop = CreateObject(model, x, y, z + 0.2, false, false, false);
    AttachEntityToEntity(
      prop,
      ped,
      GetPedBoneIndex(ped, 57005),
      0.1,
      0.02,
      -0.03,
      -90,
      170,
      79,
      true,
      true,
      false,
      true,
      1,
      true,
    );
    SetModelAsNoLongerNeeded(model);
  }
  await player.playAnim(SHOW_ANIM.dict, SHOW_ANIM.clip, {
    blendIn: 3,
    blendOut: -1,
    flag: 50,
  });
  setTimeout(() => {
    if (prop) DeleteEntity(prop);
    player.stopAnim();
  }, SHOW_MS);
}

const screen = new CardScreen();
onServerEvent(
  EVENTS.showCard,
  {
    args: ([raw]) => {
      const v = record(raw);
      const seconds = readInt(v.seconds, 2, 60);
      return typeof v.item === "string" && seconds !== null
        ? [toIdCard(v.item, v, readId(v.holder), seconds)]
        : null;
    },
  },
  (card) => void screen.show(card),
);
onServerEvent(EVENTS.showing, () => void playShowing());
on("onResourceStop", (resource: string) => {
  if (resource === ResourceName) screen.stop();
});
