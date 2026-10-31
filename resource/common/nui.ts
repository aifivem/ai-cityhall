/** The document card's NUI contract (client -> web). No natives. */

/** A shown document as the page draws it; texts already picked by the client. */
export interface CardView {
  /** Changes with every show: a new card replaces the one on screen. */
  id: number;
  /** The document's name (lang `HALL_DOC_<ITEM>`). */
  title: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  /** Translated, "" when unknown. */
  sex: string;
  nationality: string;
  citizenid: string;
  /** `https://nui-img/...` headshot of the holder, null without one. */
  photo: string | null;
  /** How long the card stays (client clock). */
  ms: number;
}

export type NuiMessage =
  | { action: "texts"; data: Record<string, string> }
  | { action: "show"; data: CardView }
  | { action: "hide"; data: null };
