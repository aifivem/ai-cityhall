# ai-cityhall

City hall counters: the job center (public jobs at a start grade, through ai-core's `SetJob`) and documents (items with the holder's name, birth date and citizen id; using one shows it to everyone within 3 m). Uses ai-core's shared menu, no NUI of its own. Depends on ai-core; documents go through the active inventory through ai-core's inventory layer (lib `inventory`).

## Decisions

- Offered jobs and documents are a server-only panel file (`settings`, `sync: "admin"`); the client asks for the offer at the counter. Jobs missing from ai-core's job list are skipped.
- A document is a unique item (stack 1) whose metadata carries the holder; showing it keeps it. Document items are registered as usable at start and on every settings change (once per item name), so a document added in the panel works at once; a removed one stays registered until a restart but does nothing.
- Each city hall's blip look is a panel `blip` widget on the hall record (`blipStyle`).

## Contracts

- Callbacks: `resource/common/hall.ts`. Items `id_card`, `driver_license` (defaults in ai-inventory's item list).

## Entry points

- Server `resource/server/index.ts` (panel `server/schema.ts`); client counter and menu `resource/client/index.ts`.
