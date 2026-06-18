import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConversionService } from '../../services/conversion.service';
import { SYSTEMS, SystemId, Quantity } from '../../models/unit.model';

interface Row {
  qty: string;
  qsym: string;
  unitName: string;
  unitSym: string;
  system: SystemId;
  qtyCategory: string;
  quantityId: string;
  unitId: string;
  convertible: boolean;
}
interface Group {
  category: string;
  rows: Row[];
}

@Component({
  selector: 'app-reference',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <h2>Reference</h2>
    <p class="page-intro">
      Every quantity, its measurement systems, and the unit symbols — {{ totalUnits }} units across
      {{ service.quantities.length }} quantities. Search by name or symbol, or filter by system.
    </p>

    <div class="card">
      <input class="input" type="search" placeholder="Search quantities or units…"
             [ngModel]="term()" (ngModelChange)="term.set($event)" />
      <div class="chip-row" style="margin-top: 0.9rem;">
        <button class="chip" [class.active]="sys() === 'all'" (click)="sys.set('all')">All systems</button>
        @for (s of systems; track s.id) {
          <button class="chip" [class.active]="sys() === s.id" (click)="sys.set(s.id)">{{ s.label }}</button>
        }
      </div>
    </div>

    <p style="color: var(--text-faint); font-size: 0.85rem; margin: 1.25rem 0 0.5rem;">
      {{ shownCount() }} unit{{ shownCount() === 1 ? '' : 's' }} shown
    </p>

    @if (favouriteRows().length > 0) {
      <div class="card" style="padding: 0.6rem 1rem;">
        <h3 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-faint); margin: 0.5rem 0.2rem;">
          Favourites
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 4%;">Favourite</th>
              <th style="width: 22%;">Quantity</th>
              <th style="width: 6%;">Sym.</th>
              <th style="width: 18%;">System</th>
              <th style="width: 30%;">Unit</th>
              <th style="width: 10%;">Symbol</th>
              <th style="width: 10%;">Convert</th>
            </tr>
          </thead>
          <tbody>
            @for (r of favouriteRows(); track r.quantityId + r.unitId) {
              <tr>
                <td class="cb-cell">
                  <input type="checkbox" checked
                         (change)="toggleFavourite(r, $event)" />
                </td>
                <td>{{ r.qty }}</td>
                <td class="mono">{{ r.qsym || '—' }}</td>
                <td><span class="badge" [class]="'badge ' + r.system">{{ label(r.system) }}</span></td>
                <td>{{ r.unitName }}</td>
                <td class="mono">{{ r.unitSym }}</td>
                <td>
                  @if (r.convertible) {
                    <a class="btn btn-ghost btn-xs"
                       [routerLink]="['/converter']"
                       [queryParams]="{ q: r.quantityId, from: r.unitId }"
                       title="Convert {{ r.unitName }}">⇄</a>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @for (group of groups(); track group.category) {
      <div class="card" style="padding: 0.6rem 1rem;">
        <h3 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-faint); margin: 0.5rem 0.2rem;">
          {{ group.category }}
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 4%;">Favourite</th>
              <th style="width: 22%;">Quantity</th>
              <th style="width: 6%;">Sym.</th>
              <th style="width: 18%;">System</th>
              <th style="width: 30%;">Unit</th>
              <th style="width: 10%;">Symbol</th>
              <th style="width: 10%;">Convert</th>
            </tr>
          </thead>
          <tbody>
            @for (r of group.rows; track r.unitName + r.unitSym + r.qty) {
              <tr>
                <td class="cb-cell">
                  <input type="checkbox"
                         [checked]="isFavourited(r.quantityId, r.unitId)"
                         (change)="toggleFavourite(r, $event)" />
                </td>
                <td>{{ r.qty }}</td>
                <td class="mono">{{ r.qsym || '—' }}</td>
                <td><span class="badge" [class]="'badge ' + r.system">{{ label(r.system) }}</span></td>
                <td>{{ r.unitName }}</td>
                <td class="mono">{{ r.unitSym }}</td>
                <td>
                  @if (r.convertible) {
                    <a class="btn btn-ghost btn-xs"
                       [routerLink]="['/converter']"
                       [queryParams]="{ q: r.quantityId, from: r.unitId }"
                       title="Convert {{ r.unitName }}">⇄</a>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (groups().length === 0) {
      <div class="empty">No matching units found.</div>
    }
  `,
  styles: [`
    .cb-cell { text-align: center; vertical-align: middle; padding: 0.3rem 0.4rem; }
    .cb-cell input[type="checkbox"] { cursor: pointer; accent-color: var(--accent); width: 15px; height: 15px; }
  `],
})
export class ReferenceComponent {
  readonly service = inject(ConversionService);
  readonly systems = SYSTEMS;

  readonly term = signal('');
  readonly sys = signal<SystemId | 'all'>('all');

  readonly totalUnits = this.service.quantities.reduce((n, q) => n + q.units.length, 0);

  private readonly allRows: Row[] = this.buildRows(this.service.quantities);

  private readonly favouriteKeys = signal<Set<string>>(new Set());

  readonly favouriteRows = computed<Row[]>(() => {
    const keys = this.favouriteKeys();
    return this.allRows.filter((r) => keys.has(`${r.quantityId}|${r.unitId}`));
  });

  readonly groups = computed<Group[]>(() => {
    const q = this.term().trim().toLowerCase();
    const sys = this.sys();
    const filtered = this.allRows.filter((r) => {
      const matchSys = sys === 'all' || r.system === sys;
      const matchTerm =
        !q ||
        r.qty.toLowerCase().includes(q) ||
        r.unitName.toLowerCase().includes(q) ||
        r.unitSym.toLowerCase().includes(q) ||
        r.qsym.toLowerCase().includes(q);
      return matchSys && matchTerm;
    });
    const byCat = new Map<string, Row[]>();
    for (const r of filtered) {
      const arr = byCat.get(r.qtyCategory) ?? [];
      arr.push(r);
      byCat.set(r.qtyCategory, arr);
    }
    return [...byCat.entries()].map(([category, rows]) => ({ category, rows }));
  });

  readonly shownCount = computed(() => this.groups().reduce((n, g) => n + g.rows.length, 0));

  isFavourited(quantityId: string, unitId: string): boolean {
    return this.favouriteKeys().has(`${quantityId}|${unitId}`);
  }

  toggleFavourite(row: Row, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const key = `${row.quantityId}|${row.unitId}`;
    const next = new Set(this.favouriteKeys());
    if (checked) next.add(key);
    else next.delete(key);
    this.favouriteKeys.set(next);
  }

  private buildRows(quantities: Quantity[]): Row[] {
    const rows: Row[] = [];
    for (const q of quantities) {
      const convertible = q.units.length >= 2;
      for (const u of q.units) {
        rows.push({
          qty: q.name,
          qsym: q.symbol,
          unitName: u.name,
          unitSym: u.symbol,
          system: u.system,
          qtyCategory: q.category,
          quantityId: q.id,
          unitId: u.id,
          convertible,
        });
      }
    }
    return rows;
  }

  label(id: SystemId): string {
    return SYSTEMS.find((s) => s.id === id)?.label ?? id;
  }
}
