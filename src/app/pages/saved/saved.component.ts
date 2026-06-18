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
  template: `
    <h2>Saved</h2>
    <p class="page-intro">
      Your pinned conversion pairs and recent conversion history. Tap any item to reopen it in the
      converter. Stored locally in this browser.
    </p>

    <div class="card">
      <h3>★ Favourite pairs</h3>
      @if (storage.favourites().length === 0) {
        <p class="empty" style="padding: 1.5rem 0;">
          No favourites yet. In the converter, choose a pair and tap “Save pair”.
        </p>
      } @else {
        <ul class="list">
          @for (f of storage.favourites(); track f.id) {
            <li>
              <button class="item" type="button" (click)="openFav(f)">
                <span class="item-title">{{ quantityName(f.quantityId) }}</span>
                <span class="mono item-sub">{{ unitLabel(f.quantityId, f.fromId) }} → {{ unitLabel(f.quantityId, f.toId) }}</span>
              </button>
              <button class="btn btn-icon btn-ghost" type="button" (click)="storage.removeFavourite(f.id)" aria-label="Remove">✕</button>
            </li>
          }
        </ul>
      }
    </div>

    <div class="card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3 style="margin: 0;">Recent history</h3>
        @if (storage.history().length > 0) {
          <button class="btn btn-ghost" type="button" (click)="storage.clearHistory()">Clear</button>
        }
      </div>
      @if (storage.history().length === 0) {
        <p class="empty" style="padding: 1.5rem 0;">No conversions yet.</p>
      } @else {
        <ul class="list" style="margin-top: 0.75rem;">
          @for (h of storage.history(); track h.ts) {
            <li>
              <button class="item" type="button" (click)="openHistory(h)">
                <span class="mono item-title">
                  {{ fmt(h.value) }} {{ unitSym(h.quantityId, h.fromId) }} = {{ fmt(h.result) }} {{ unitSym(h.quantityId, h.toId) }}
                </span>
                <span class="item-sub">{{ quantityName(h.quantityId) }} · {{ time(h.ts) }}</span>
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
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
