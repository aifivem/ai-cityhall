import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { isEnvBrowser, useNuiEvent } from "fivem-nui-react";
import type { CardView } from "../../resource/common/nui";
import { IdCard } from "./IdCard";
import { MOCK_CARD, MOCK_TEXTS } from "./dev/mock";
import { setTexts } from "./lib/lang";

/** A shown document on the left of the screen, no focus; it leaves after its time (client clock) or for the next one. */
export function App() {
  const [card, setCard] = useState<CardView | null>(null);

  useNuiEvent<Record<string, string>>("texts", setTexts);
  useNuiEvent<CardView>("show", setCard);
  useNuiEvent("hide", () => setCard(null));

  useEffect(() => {
    if (!card) return;
    const timer = setTimeout(
      () => setCard((now) => (now?.id === card.id ? null : now)),
      card.ms,
    );
    return () => clearTimeout(timer);
  }, [card]);

  // Browser preview: one card from the mock.
  useEffect(() => {
    if (!isEnvBrowser()) return;
    setTexts(MOCK_TEXTS);
    setCard(MOCK_CARD);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-y-0 left-[3vh] my-auto h-fit w-[46vh]">
      <AnimatePresence mode="wait">
        {card && (
          <motion.div
            key={card.id}
            initial={{ x: "-120%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-120%", opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          >
            <IdCard card={card} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
