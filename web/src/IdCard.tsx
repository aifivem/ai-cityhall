import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard, faUser } from "@fortawesome/free-solid-svg-icons";
import type { CardView } from "../../resource/common/nui";
import { useLang } from "./lib/lang";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[0.2vh]">
      <span className="text-text-3 text-[1.05vh] font-semibold uppercase">
        {label}
      </span>
      <span className="text-text truncate text-[1.5vh] font-semibold">
        {value || "-"}
      </span>
    </div>
  );
}

/**
 * A document (qbx_idcard's card in the TGIANN look): state line, document name, the holder's headshot, the fields
 * written on the item and the citizen id; a green bar drains over the time it stays.
 */
export function IdCard({ card }: { card: CardView }) {
  const t = useLang();
  return (
    <div className="bg-panel relative overflow-hidden rounded-[1.4vh] border border-white/10 shadow-[0_2.4vh_6.4vh_rgba(0,0,0,0.6)]">
      <div className="bg-header flex items-center gap-[1vh] border-b border-white/8 px-[1.6vh] py-[1.2vh]">
        <span className="bg-tgi-green-10 text-tgi-green flex size-[3.6vh] shrink-0 items-center justify-center rounded-full text-[1.6vh]">
          <FontAwesomeIcon icon={faIdCard} />
        </span>
        <div className="flex min-w-0 flex-col gap-[0.4vh]">
          <span className="text-text-3 text-[1.1vh] font-semibold uppercase">
            {t("HALL_CARD_STATE")}
          </span>
          <span className="font-display truncate text-[1.9vh] leading-none tracking-[-0.01em] uppercase">
            {card.title}
          </span>
        </div>
      </div>
      <div className="flex gap-[1.6vh] p-[1.6vh]">
        <div className="bg-surface flex h-[15vh] w-[12vh] shrink-0 items-center justify-center overflow-hidden rounded-[1vh] border border-white/8">
          {card.photo ? (
            <img src={card.photo} alt="" className="size-full object-cover" />
          ) : (
            <div className="text-text-4 flex flex-col items-center gap-[0.6vh]">
              <FontAwesomeIcon icon={faUser} className="text-[4vh]" />
              <span className="text-[1vh] font-semibold uppercase">
                {t("HALL_CARD_NO_PHOTO")}
              </span>
            </div>
          )}
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 content-start gap-x-[1.2vh] gap-y-[1.1vh]">
          <Field label={t("HALL_CARD_LASTNAME")} value={card.lastname} />
          <Field label={t("HALL_CARD_FIRSTNAME")} value={card.firstname} />
          <Field label={t("HALL_CARD_BIRTHDATE")} value={card.birthdate} />
          <Field label={t("HALL_CARD_SEX")} value={card.sex} />
          <Field label={t("HALL_CARD_NATIONALITY")} value={card.nationality} />
          <div className="flex min-w-0 flex-col gap-[0.3vh]">
            <span className="text-text-3 text-[1.05vh] font-semibold uppercase">
              {t("HALL_CARD_CITIZENID")}
            </span>
            <span className="bg-tgi-green-10 text-tgi-green w-fit rounded-[0.4vh] px-[0.6vh] py-[0.1vh] font-mono text-[1.4vh] font-bold tabular-nums">
              {card.citizenid || "-"}
            </span>
          </div>
        </div>
      </div>
      <div className="h-[0.3vh] bg-white/4">
        <div
          className="bg-tgi-green h-full origin-left will-change-transform"
          style={{ animation: `drain ${card.ms}ms linear forwards` }}
        />
      </div>
    </div>
  );
}
