import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ConversionService } from '../../services/conversion.service';
import { ReferenceResetService } from '../../services/reference-reset.service';
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
  readonly sys = signal<SystemId | 'all'>('si');
  readonly activeTab = signal<string>('');
  private readonly expandedCategories = signal<Set<string>>(new Set());

  readonly categories: string[] = [...new Set(this.service.quantities.map(q => q.category))].sort();

  readonly filteredCategories = computed<string[]>(() => {
    const sys = this.sys();
    if (sys === 'all') return this.categories;
    const validCats = new Set<string>();
    for (const r of this.allRows) {
      if (r.system === sys) validCats.add(r.qtyCategory);
    }
    return this.categories.filter(c => validCats.has(c));
  });

  readonly totalUnits = this.service.quantities.reduce((n, q) => n + q.units.length, 0);

  private readonly allRows: Row[] = this.buildRows(this.service.quantities);

  readonly groups = computed<Group[]>(() => {
    const q = this.term().trim().toLowerCase();
    const sys = this.sys();
    const cat = this.activeTab();
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
    return [...byCat.entries()].map(([category, rows]) => ({ category, rows })).sort((a, b) => a.category.localeCompare(b.category));
  });

  readonly shownCount = computed(() => this.groups().reduce((n, g) => n + g.rows.length, 0));

  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.activeTab.set(this.filteredCategories()[0] ?? '');

    effect(() => {
      const cats = this.filteredCategories();
      const current = this.activeTab();
      if (current !== 'all' && !cats.includes(current)) {
        this.activeTab.set(cats[0] ?? 'all');
      }
    }, { allowSignalWrites: true });

    this.route.queryParamMap.subscribe(params => {
      const search = params.get('search');
      if (search) {
        this.sys.set('all');
        this.activeTab.set('all');
        this.term.set(search);
      }
    });

    inject(ReferenceResetService).reset$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.sys.set('si');
      this.term.set('');
    });
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

  selectSystem(id: SystemId | 'all'): void {
    this.sys.set(id);
    this.activeTab.set(this.filteredCategories()[0] ?? '');
  }

  label(id: SystemId): string {
    return SYSTEMS.find((s) => s.id === id)?.label ?? id;
  }
}
