# Measure — units, quantities & conversions

A small Angular 18 (standalone components) web app for exploring measurement units and converting
between them. Built to be dependency-light so it runs in a fresh project with no UI framework — drop
your own PrimeNG/Apollo styling in later.

## Run it

```bash
npm install
npm start
```

Then open <http://localhost:4200>. (`npm start` runs `ng serve` in development mode.)

> Requires Node 18.19+ / 20.9+ and the Angular CLI conventions that ship with Angular 18. You don't
> need a global CLI install — the local `@angular/cli` dev dependency is used via the `ng` script.

## Menu / features

| Route | What it does |
|-------|--------------|
| **Reference** (`/reference`) | The full categorised table of every quantity, its systems and unit symbols. Search + filter by measurement system. Checkbox on each row pins it to a Favourites table at the top of the page. Each row also has a ⇄ button that opens it directly in the Converter. |
| **Converter** (`/converter`) | Pick a quantity, then a unit on each side, and convert live (e.g. mile ↔ kilometre). Only physically compatible units are ever offered. Includes a full breakdown into every unit, a swap button, and a "save pair" favourite toggle. Deep-linkable via `?q=&from=&to=&v=`. |
| **Prefixes** (`/prefixes`) | SI prefix scaler — express a value across every prefix from yotta (10²⁴) to yocto (10⁻²⁴). |
| **Formulas** (`/formulas`) | Searchable reference of common physics formulas with each variable and its SI unit. |
| **Quiz** (`/quiz`) | Randomised multiple-choice practice (symbols, quantities, systems, conversions) with score, streak and a best-score saved locally. |
| **Saved** (`/saved`) | Favourite conversion pairs and recent conversion history; tap any item to reopen it in the converter. |

## How conversions work

Each quantity defines a base unit. Every unit carries a `factor` (and, for temperature only, an
`offset`) so that:

```
base  = value * factor + (offset ?? 0)
value = (base - (offset ?? 0)) / factor
```

To convert A → B within a quantity: take A to base, then base to B. Factors are exact where an exact
definition exists (e.g. 1 inch = 0.0254 m, 1 lb = 0.453 592 37 kg). Temperature uses affine offsets
(°C, °F, K, °R). See `src/app/data/units.data.ts` — that single file is the source of truth for
units, SI prefixes and formulas, so most customisation happens there.

## Project layout

```
src/
  main.ts                      bootstrap + router
  styles.css                   global theme (light/dark via prefers-color-scheme)
  app/
    app.component.ts           shell: header, nav menu, router outlet
    app.routes.ts              lazy-loaded routes
    models/unit.model.ts       types: Unit, Quantity, Formula, SiPrefix, Favourite, HistoryItem
    data/units.data.ts         the dataset (quantities, prefixes, formulas)
    services/
      conversion.service.ts    factor/offset maths, lookups, breakdown
      storage.service.ts       favourites/history/best-score via localStorage signals
    shared/format.util.ts      locale-neutral number formatting
    pages/
      reference/  converter/  prefixes/  formulas/  quiz/  saved/
```

## Notes / things you'll likely customise

- **Styling is deliberately plain CSS** (CSS variables, no framework) so it runs anywhere. To match
  your real stack, swap the components' inline templates for PrimeNG components and the Apollo theme.
- **Persistence is `localStorage`** (favourites, history, best score). Replace `StorageService` with
  an API/EF Core-backed service if you want it server-side.
- **`strictTemplates` is off** in `tsconfig.json` to keep the first build smooth; turn it back on once
  you're iterating in your editor.
- **Adding a unit**: add an entry to the relevant quantity's `units[]` in `units.data.ts` with a
  unique `id`, a `symbol`, a `system`, and a `factor` relative to that quantity's base unit. It will
  appear automatically in the reference, converter, breakdown and quiz.
- **`year`** uses the Julian year (365.25 days); change the factor in `units.data.ts` if you prefer
  365 days.

Built June 2026.
