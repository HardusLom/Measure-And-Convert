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
  styleUrl: './reference.component.css',
})
export class ReferenceComponent {
  readonly service = inject(ConversionService);
  readonly systems = SYSTEMS;
  readonly categoryInfo = CATEGORY_INFO;

  readonly term = signal('');
  readonly sys = signal<SystemId | 'all'>('all');
  readonly selectedCategory = signal<string | 'all'>('all');
  private readonly expandedCategories = signal<Set<string>>(new Set());

  readonly categories: string[] = [...new Set(this.service.quantities.map(q => q.category))];

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
    const cat = this.selectedCategory();
    const filtered = this.allRows.filter((r) => {
      const matchSys = sys === 'all' || r.system === sys;
      const matchCat = cat === 'all' || r.qtyCategory === cat;
      const matchTerm =
        !q ||
        r.qty.toLowerCase().includes(q) ||
        r.unitName.toLowerCase().includes(q) ||
        r.unitSym.toLowerCase().includes(q) ||
        r.qsym.toLowerCase().includes(q);
      return matchSys && matchCat && matchTerm;
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
