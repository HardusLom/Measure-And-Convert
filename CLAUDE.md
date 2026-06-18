# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at http://localhost:4200 (ng serve)
npm run build      # production build
npm run watch      # incremental dev build
```

No test runner is configured — there are no test files.

## Architecture

Angular 18 standalone-component SPA. No UI framework — plain CSS with CSS variables and `prefers-color-scheme` for theming.

**Data flow:** `units.data.ts` → `ConversionService` → page components → `StorageService`

### Key files

| File | Role |
|------|------|
| `src/app/data/units.data.ts` | Single source of truth for all `QUANTITIES`, `SI_PREFIXES`, and `FORMULAS`. Editing units/formulas starts here. |
| `src/app/models/unit.model.ts` | All TypeScript interfaces: `Unit`, `Quantity`, `Formula`, `SiPrefix`, `Favourite`, `HistoryItem`. |
| `src/app/services/conversion.service.ts` | Stateless math: `convert()`, `breakdown()`, and dataset lookups. |
| `src/app/services/storage.service.ts` | Angular signals wrapping `localStorage` for favourites, history (capped at 25), and quiz best score. |
| `src/app/app.routes.ts` | Lazy-loaded routes for all six pages. |

### Conversion math

Every `Unit` has a `factor` and optional `offset` relative to its quantity's base unit:

```
base  = value * factor + (offset ?? 0)
value = (base - (offset ?? 0)) / factor
```

`offset` is only non-zero for temperature (affine scales). A→B conversion: A→base→B.

### Adding a unit

Add an entry to the relevant quantity's `units[]` in `units.data.ts` with a unique `id`, `name`, `symbol`, `system` (`si | metric | imperial | us | other`), and `factor` relative to the quantity's base unit. It propagates automatically to the reference table, converter, breakdown and quiz.

### Converter deep-linking

The `/converter` route reads `?q=&from=&to=&v=` query params on load — maintain these when modifying the converter component.

### State management

`StorageService` uses Angular signals (`signal<T>()`). Components read state reactively; mutations call service methods that update both the signal and `localStorage` in one step.

## Notes

- `strictTemplates` is **off** in `tsconfig.json` — turn it on when iterating in your editor.
- The Julian year (365.25 days) is used for the `year` unit in `units.data.ts`.
- Persistence is `localStorage` only. To go server-side, replace `StorageService`.
