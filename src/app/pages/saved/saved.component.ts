import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConversionService } from '../../services/conversion.service';
import { StorageService } from '../../services/storage.service';
import { Favourite, HistoryItem } from '../../models/unit.model';
import { fmt } from '../../shared/format.util';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [],
  templateUrl: './saved.component.html',
  styles: [
    `
      .list { list-style: none; margin: 0.5rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
      .list li { display: flex; align-items: center; gap: 0.5rem; }
      .item {
        flex: 1; text-align: left;
        display: flex; flex-direction: column; gap: 0.15rem;
        padding: 0.7rem 0.85rem;
        background: var(--surface); color: var(--text);
        border: 1px solid var(--border); border-radius: var(--radius-sm);
        cursor: pointer; transition: background 0.12s;
      }
      .item:hover { background: var(--surface-2); }
      .item-title { font-weight: 600; }
      .item-sub { font-size: 0.82rem; color: var(--text-faint); }
    `,
  ],
})
export class SavedComponent {
  readonly service = inject(ConversionService);
  readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  readonly fmt = fmt;

  quantityName(id: string): string {
    return this.service.getQuantity(id)?.name ?? id;
  }

  unitLabel(quantityId: string, unitId: string): string {
    const q = this.service.getQuantity(quantityId);
    const u = q && this.service.getUnit(q, unitId);
    return u ? `${u.name} (${u.symbol})` : unitId;
  }

  unitSym(quantityId: string, unitId: string): string {
    const q = this.service.getQuantity(quantityId);
    const u = q && this.service.getUnit(q, unitId);
    return u?.symbol ?? unitId;
  }

  time(ts: number): string {
    return new Date(ts).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' });
  }

  openFav(f: Favourite): void {
    this.router.navigate(['/converter'], { queryParams: { q: f.quantityId, from: f.fromId, to: f.toId } });
  }

  openHistory(h: HistoryItem): void {
    this.router.navigate(['/converter'], {
      queryParams: { q: h.quantityId, from: h.fromId, to: h.toId, v: h.value },
    });
  }
}
