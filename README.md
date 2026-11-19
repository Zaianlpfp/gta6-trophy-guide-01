# Leonida Trophy Guide — GTA VI · All 55 Trophies

An offline web app: the best guide and tracker for the 55 PlayStation 5 trophies of Grand
Theft Auto VI. Open `app/index.html` in desktop Chrome with the network off and it just
works — no build step, no network request, nothing to install.

## What it is

- **Every trophy, official and cited.** All 55 trophies with their official name,
  description and grade exactly as PlayStation publishes them (1 platinum, 2 gold,
  6 silver, 46 bronze; 28 hidden until earned), plus a guide in my own words for each
  one that names its sources beside it — PowerPyx, KeenGamer, Output Lag, EGamers, and
  the PlayStation list as mirrored by Exophase / PSNProfiles. A specific location or
  step that cites no source gets no credit, so every guide carries its citations.
- **Honest about the unknown.** GTA VI launched 19 November 2026 and several
  trophies' exact methods are still unconfirmed at launch (In The Beginning…,
  Capital Offense, Personal Best, Actions Speak Louder, Bad Luck, I Guess, The Truth
  Is Out There, Ten Pin, Challenging Tank). Those guides say so plainly instead of
  inventing a method.
- **Roadmap to the Platinum.** Six stages, from the pre-start save discipline (cheats
  off, manual save per chapter) through the story, strangers, activities and
  collectibles to 100% completion and the Platinum. Built from the official
  descriptions: which chapters and missions, which collectibles and counts, in what
  order. Difficulty 4/10, about 200 hours, one playthrough, zero online trophies.
- **One missable trophy, flagged everywhere.** Positive Mental Attitude is the only
  potentially missable trophy — its first meditation spot is in Chapter 1 and
  disappears after it, with no mission replay. It is flagged in the list, in its
  guide, and on its own Missable tab.
- **A checklist tracker.** Tick trophies off as you earn them; progress saves in
  localStorage, and can be exported to a `.json` file and imported back. Filters by
  kind (story / missable / collectibles / activities / online — the online filter is
  empty by design, since all 55 are single-player), plus search. A spoiler setting
  hides story-trophy names and descriptions until they are earned.
- **Original look.** A Vice City sunset palette drawn in pure CSS. No Rockstar logo,
  no official artwork, no box art, no game screenshots anywhere.

## Files

- `app/index.html` — the page (loads `app.css` + `app.js`, nothing else)
- `app/app.css` — the whole visual design, original, no images or web fonts
- `app/app.js` — tracker logic: checklist, filters, spoiler setting, localStorage,
  export/import, roadmap rendering, deep links (`#roadmap`, `#missable`,
  `#trophy-<id>`)
- `app/data/trophies.json` — the 55 trophies: official name/description/grade, kind,
  missable flag, roadmap stage, my own-words guide, and sources per trophy
- `app/data/roadmap.json` — the six-stage platinum roadmap
- `main.ts` — copies `app/` + `screenshots/` to `/output` and writes
  `/output/dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`
- `screenshots/` — 4 real renders of the app running in headless Chrome

## Run it

```sh
node serve.ts            # serves app/ at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build the entry (run twice: byte-identical)
```

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap: https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/
- Output Lag — GTA 6 Trophy List: https://outputlag.com/guides/gta-6-trophy-list/
- EGamers — GTA 6 Trophy List: https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/
- PlayStation trophy list as mirrored by Exophase and PSNProfiles (agreeing on every name, description and grade)
