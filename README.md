# UnitLab — units, quantities & conversions

An Angular 18 (standalone components) SPA for exploring measurement units, converting between them, and learning via quiz. No UI framework — plain CSS with CSS variables and `prefers-color-scheme` for light/dark theming. Ships as a PWA.

## Run it

```bash
npm install
npm start
```

Then open <http://localhost:4200>. (`npm start` runs `ng serve` in development mode.)

> Requires Node 18.19+ / 20.9+. No global Angular CLI install needed — the local `@angular/cli` dev dependency is used via the `ng` script.

## Pages

| Route | What it does |
|-------|--------------|
| **Reference** (`/reference`) | Full categorised table of every unit and symbol. Filter by measurement system, search, expand a category's description panel with ⓘ, checkbox any row to pin it to a live Favourites table at the top. Each row has a ⇄ button that opens the unit directly in the Converter, and a **𝐖** link to the unit's Wikipedia article (where available). |
| **Converter** (`/converter`) | Pick a quantity and a unit on each side; both fields update live. Features: compound-unit display (e.g. 5 ft 9 in), scale visualiser bar, formula explainer (e.g. °F = °C × 1.8 + 32), multi-step conversion chain, cards/table toggle for the full breakdown, copy-result and copy-link buttons, favourite toggle. Deep-linkable via `?q=&from=&to=&v=`. |
| **Prefixes** (`/prefixes`) | SI prefix scaler — express a value across all 20 prefixes from yotta (10²⁴) to yocto (10⁻²⁴). |
| **Formulas** (`/formulas`) | Searchable reference of common physics formulas with each variable and its SI unit. |
| **Quiz** (`/quiz`) | Randomised multiple-choice practice. Three difficulty levels (Easy / Medium / Hard) and a category filter. Score, streak, and per-difficulty best scores saved locally. |
| **Saved** (`/saved`) | Favourite conversion pairs and recent conversion history; tap any item to reopen it in the Converter. |

### Global search

The header search box filters all units by name, symbol, or quantity as you type. Selecting a result (mouse or ↑ ↓ Enter) is context-aware: on `/reference` it searches the reference table; on `/formulas` it filters formulas; anywhere else it opens the unit in the Converter.

## How conversions work

Each quantity defines a base unit. Every unit carries a `factor` (and, for temperature only, an `offset`) so that:

```
base  = value * factor + (offset ?? 0)
value = (base - (offset ?? 0)) / factor
```

To convert A → B: take A to base, then base to B. Factors are exact where an exact definition exists (1 inch = 0.0254 m, 1 lb = 0.453 592 37 kg). Temperature uses affine offsets (°C, °F, K, °R).

`src/app/data/units.data.ts` is the single source of truth for units, SI prefixes, formulas, and category metadata.

## Project layout

```
scripts/
  set-version.mjs              stamps environment.ts with the current version before each build
src/
  main.ts                      bootstrap + router + service-worker registration
  manifest.webmanifest         PWA install metadata and icon set
  styles.css                   global theme (light/dark via prefers-color-scheme)
  environments/
    environment.ts             version string (written by set-version.mjs)
  assets/icons/                PNG icons for PWA (72 → 512 px)
  app/
    app.component.ts/html      shell: header (global search, hamburger nav), footer, router outlet
    app.routes.ts              lazy-loaded routes
    models/unit.model.ts       types: Unit, Quantity, Formula, SiPrefix, Favourite, HistoryItem
    data/units.data.ts         the dataset (quantities, prefixes, formulas, category metadata)
    services/
      conversion.service.ts      factor/offset maths, lookups, breakdown
      storage.service.ts         favourites/history/per-difficulty best-scores via localStorage signals
      reference-reset.service.ts RxJS Subject bus — fires when the user re-navigates to /reference
    shared/
      format.util.ts             fmt() — locale-neutral number formatter (thin-space thousands, scientific at extremes)
    pages/
      reference/  converter/  prefixes/  formulas/  quiz/  saved/
ngsw-config.json               Angular service-worker caching config
```

## Notes / things you'll likely customise

- **Styling is plain CSS** (CSS variables, no framework). To match your stack, swap the components' templates for PrimeNG / Angular Material components.
- **Persistence is `localStorage`** (favourites, history, per-difficulty best scores). Replace `StorageService` with an API-backed service for server-side storage.
- **`strictTemplates` is off** in `tsconfig.json`; turn it on when iterating in your editor.
- **Adding a unit**: add an entry to the relevant quantity's `units[]` in `units.data.ts` with a unique `id`, a `symbol`, a `system`, and a `factor` relative to that quantity's base unit. Optionally include a `wikipediaUrl` to surface a **𝐖** link in the reference table. The unit appears automatically in the reference, converter, breakdown, and quiz.
- **`year`** uses the Julian year (365.25 days); change the factor in `units.data.ts` if you prefer 365 days.
- **PWA**: the app installs as a standalone PWA in production builds. The service worker is disabled in dev mode (`ng serve`).

Built June 2026.
