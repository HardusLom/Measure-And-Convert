import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConversionService } from '../../services/conversion.service';
import { SYSTEMS, SystemId, Quantity } from '../../models/unit.model';
import { CATEGORY_INFO } from '../../data/units.data';

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
  templateUrl: './reference.component.html',
  styles: [`
    .cb-cell { text-align: center; vertical-align: middle; padding: 0.3rem 0.4rem; }
    .cb-cell input[type="checkbox"] { cursor: pointer; accent-color: var(--accent); width: 15px; height: 15px; }
    .cat-header { display: flex; align-items: center; gap: 0.5rem; }
    .info-toggle {
      background: none; border: 1px solid var(--border, #ccc); cursor: pointer;
      color: var(--text-faint); font-size: 0.8rem; padding: 0.1rem 0.45rem;
      border-radius: 50%; line-height: 1.4; transition: color 0.15s, background 0.15s;
    }
    .info-toggle:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-subtle, rgba(0,0,0,0.05)); }
    .cat-info {
      font-size: 0.855rem; color: var(--text-secondary, var(--text-faint)); line-height: 1.65;
      margin: 0 0.2rem 0.75rem; padding: 0.65rem 0.9rem;
      background: var(--surface-alt, var(--bg)); border-radius: 6px;
      border-left: 3px solid var(--accent);
    }
  `],
})
export class ReferenceComponent {
  readonly service = inject(ConversionService);
  readonly systems = SYSTEMS;
  readonly categoryInfo = CATEGORY_INFO;

  readonly term = signal('');
  readonly sys = signal<SystemId | 'all'>('all');
  private readonly expandedCategories = signal<Set<string>>(new Set());

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

  isExpanded(category: string): boolean {
    return this.expandedCategories().has(category);
  }

  toggleInfo(category: string): void {
    const next = new Set(this.expandedCategories());
    if (next.has(category)) next.delete(category);
    else next.add(category);
    this.expandedCategories.set(next);
  }

  label(id: SystemId): string {
    return SYSTEMS.find((s) => s.id === id)?.label ?? id;
  }
}
