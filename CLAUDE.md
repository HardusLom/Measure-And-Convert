# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # set-version.mjs then ng serve → http://localhost:4200
npm run build      # set-version.mjs then ng build (production)
npm run watch      # set-version.mjs then ng build --watch (development)
```

`scripts/set-version.mjs` stamps `src/environments/environment.ts` with the current version before every build/serve; the value is logged to the console on startup.

No test runner is configured — there are no test files.

## Architecture

Angular 18 standalone-component SPA. No UI framework — plain CSS with CSS variables and `prefers-color-scheme` for theming.

**Data flow:** `units.data.ts` → `ConversionService` → page components → `StorageService`

### Key files

| File | Role |
|------|------|
| `src/app/data/units.data.ts` | Single source of truth for all `QUANTITIES`, `SI_PREFIXES`, `FORMULAS`, and `CATEGORY_INFO`. Editing units/formulas starts here. |
| `src/app/models/unit.model.ts` | All TypeScript interfaces: `Unit`, `Quantity`, `Formula`, `SiPrefix`, `Favourite`, `HistoryItem`. |
| `src/app/services/conversion.service.ts` | Stateless math: `convert()`, `breakdown()`, and dataset lookups. |
| `src/app/services/storage.service.ts` | Angular signals wrapping `localStorage` for favourites, history (capped at 25), and per-difficulty quiz best scores. |
| `src/app/app.component.ts` | Shell: header with global unit search, hamburger nav, footer, router outlet. |
| `src/app/app.routes.ts` | Lazy-loaded routes for all six pages. |
| `src/manifest.webmanifest` | PWA manifest (name, icons, display mode). |
| `ngsw-config.json` | Angular service-worker caching config. |
| `scripts/set-version.mjs` | Stamps `environment.ts` with current version before every build. |

### Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/reference` | `ReferenceComponent` | Full categorised unit table with search, system filter, per-row favourites checkbox, category info panels, and ⇄ deep-link button. |
| `/converter` | `ConverterComponent` | Live converter with compound-unit display, scale visualiser, formula explainer, chain steps, cards/table view toggle, copy-link, copy-result, favourite toggle, and conversion breakdown. |
| `/prefixes` | `PrefixesComponent` | SI prefix scaler across all 20 prefixes (yotta → yocto). |
| `/formulas` | `FormulasComponent` | Searchable physics formula reference with variables and SI units. |
| `/quiz` | `QuizComponent` | Randomised multiple-choice quiz with three difficulty levels and category filter; per-difficulty best scores persisted. |
| `/saved` | `SavedComponent` | Favourite conversion pairs and recent history; tap to reopen in Converter. |

### Conversion math

Every `Unit` has a `factor` and optional `offset` relative to its quantity's base unit:

```
base  = value * factor + (offset ?? 0)
value = (base - (offset ?? 0)) / factor
```

`offset` is only non-zero for temperature (affine scales). A→B conversion: A→base→B.

### Adding a unit

Add an entry to the relevant quantity's `units[]` in `units.data.ts` with a unique `id`, `name`, `symbol`, `system` (`si | metric | imperial | us | other`), and `factor` relative to the quantity's base unit. It propagates automatically to the reference table, converter, breakdown and quiz.

### Global header search

`AppComponent` builds an in-memory flat list of all units on startup and filters it reactively as the user types. Selecting a result navigates to `/converter?q=<quantityId>&from=<unitId>`. Keyboard navigation (↑ ↓ Enter Escape) is supported; the dropdown closes on blur with a 150 ms delay to allow click events to fire first.

### Converter deep-linking

The `/converter` route reads `?q=&from=&to=&v=` query params on load — maintain these when modifying the converter component. The reference page's per-row ⇄ button navigates to `/converter?q=<quantityId>&from=<unitId>`.

### Converter — compound units

`COMPOUND_CHAINS` in `ConverterComponent` maps quantity ids to ordered unit-id chains. When the to-unit is the first unit in a chain, a compound result (e.g. "5 ft 9 in") appears below the result input. Chains are defined for: `length` (ft→in), `mass` (st→lb, lb→oz), `time` (wk→d, d→h→min→s, h→min→s, min→s), `angle` (deg→arcmin→arcsec).

### Scroll behaviour

`withInMemoryScrolling({ scrollPositionRestoration: 'top' })` is configured in `main.ts` — every navigation scrolls to the top.

### State management

`StorageService` uses Angular signals (`signal<T>()`). Components read state reactively; mutations call service methods that update both the signal and `localStorage` in one step.

Quiz best scores are stored per difficulty (`bestScores.easy / .medium / .hard`). The top-level `bestScore` signal is kept for backwards compatibility but is deprecated.

### PWA

The app ships as a PWA. `main.ts` registers `@angular/service-worker` (enabled in production only). `src/manifest.webmanifest` provides the install metadata and icon set; `ngsw-config.json` controls caching strategy (app shell prefetch, assets lazy).

### Reference page — Favourites

The reference page has a session-only Favourites table (in-memory `Set` signal, not persisted) that appears above the category groups when at least one row is checked. Each unit row has a checkbox as its first column; checking it adds the row to Favourites, unchecking removes it. The Favourites table uses the same column structure and styling as the category tables.

## Component conventions

- All component templates must live in a separate `.html` file (`templateUrl`) — never use inline `template` strings.
- Component, template, and style files share the same directory and base name (e.g. `foo.component.ts`, `foo.component.html`, `foo.component.css`).
- All component styles must live in a separate `.css` file (`styleUrl`) — never use inline `styles: [...]` arrays.

## Notes

- `strictTemplates` is **off** in `tsconfig.json` — turn it on when iterating in your editor.
- The Julian year (365.25 days) is used for the `year` unit in `units.data.ts`.
- Persistence is `localStorage` only. To go server-side, replace `StorageService`.
