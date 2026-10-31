# ai-cityhall

City hall counters: the job center (public jobs at a start grade, through ai-core's `SetJob`) and documents (port of qbx_idcard: ID card and driver license items with the holder's data in their metadata; using one shows a card to everyone within 3 m, the holder included). Uses ai-lib's shared menu at the counter and a small NUI card for shown documents. Depends on ai-core; documents go through the active inventory through ai-core's inventory layer (lib `inventory`).

## Decisions

- Offered jobs and documents are a server-only panel file (`settings`, `sync: "admin"`); the client asks for the offer at the counter. Jobs missing from ai-core's job list are skipped.
- Job labels come from lib `definitions.job(name)` (each read once from ai-core, forgotten on a definition change); the job list in `settings.jobs` is any length (default: qb-cityhall's list).
- Each hall's point (ped, blip) comes from `RecordObjects`: an edited hall rebuilds only its own point.
- A document is a unique item (stack 1) whose metadata carries the holder (`firstname`, `lastname`, `name`, `birthdate`, `sex`, `nationality`, `citizenid`: qbx_idcard's fields); showing it keeps it. Items bought before the split fields existed carry only `name`, which the card reader splits. Document items are registered as usable at start and on every settings change (once per item name), so a document added in the panel works at once; a removed one stays registered until a restart but does nothing.
- Showing: the server sends the card (`EVENTS.showCard`) to `playersNear(source, 3)` and the showing animation (qbx_idcard's `paper_1_rcm_alt1-9` with a local `prop_franklin_dl`, 3.5 s; only the holder sees the prop, entity lockdown) to the holder. The card is a NUI overlay without focus on the left (notifications are top right, menus right, progress bottom), staying `cardSeconds` (panel, default 8) on the client clock; a new card replaces the one shown. The photo is a lib `pedHeadshot` of the holder's ped made on each viewer's client, only when the card's citizen id is the holder's own (a borrowed card shows no photo); the headshot is released when the card goes. Qbox's base64 mugshot stored in metadata is not ported (no MugShotBase64 dependency, no image in item metadata).
- Each city hall's blip look is a panel `blip` widget on the hall record (`blipStyle`).

## Contracts

- Callbacks and events: `resource/common/hall.ts`; NUI messages `resource/common/nui.ts`. Items `id_card`, `driver_license` (defaults in ai-inventory's item list).

## Entry points

- Server: offers and the job mirror `resource/server/index.ts`, buying and showing documents `server/documents.ts`, panel `server/content.ts` + `server/schema.ts`.
- Client: counter and menu `resource/client/index.ts`, shown card and the showing animation `client/card.ts`.
- NUI (card overlay, no focus): `web/src/App.tsx`, `web/src/IdCard.tsx`; browser preview `bun run webdev` (mock card).
