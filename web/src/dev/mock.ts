import en from "../../../locales/en.json";
import type { CardView } from "../../../resource/common/nui";

/** Browser preview only (`bun run webdev`): an ID card without a photo, staying a minute. */
export const MOCK_TEXTS: Record<string, string> = en;
export const MOCK_CARD: CardView = {
  id: 1,
  title: "ID card",
  firstname: "Franklin",
  lastname: "Clinton",
  birthdate: "1988-06-14",
  sex: "Male",
  nationality: "American",
  citizenid: "AIC48213",
  photo: null,
  ms: 60_000,
};
