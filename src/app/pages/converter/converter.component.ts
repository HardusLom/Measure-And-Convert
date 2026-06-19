import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConversionService } from '../../services/conversion.service';
import { StorageService } from '../../services/storage.service';
import { Quantity, Unit, SystemId, SYSTEMS } from '../../models/unit.model';
import { fmt } from '../../shared/format.util';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Converter</h2>
    <p class="page-intro">
      Convert any unit to a directly related one — e.g. mile&nbsp;↔&nbsp;kilometre. Pick a quantity,
      then a unit on each side. Conversions only ever offer physically compatible units.
    </p>

    <div class="card">
      <label class="field-label" for="qty">Quantity</label>
      <select id="qty" class="input" [ngModel]="quantityId" (ngModelChange)="onQuantityChange($event)">
        @for (q of service.convertible; track q.id) {
          <option [value]="q.id">{{ q.name }}{{ q.symbol ? ' (' + q.symbol + ')' : '' }}</option>
        }
      </select>

      <div class="convert-grid">
        <div>
          <label class="field-label" for="from">From</label>
          <input class="input" id="fromVal" type="number" inputmode="decimal"
                 [ngModel]="value" (ngModelChange)="onValueChange($event)" />
          <select class="input" id="from" style="margin-top: 0.5rem;"
                  [ngModel]="fromId" (ngModelChange)="onFromChange($event)">
            @for (u of units(); track u.id) {
              <option [value]="u.id">{{ u.name }} ({{ u.symbol }})</option>
            }
          </select>
        </div>

        <button class="btn btn-icon swap" type="button" (click)="swap()" aria-label="Swap units" title="Swap">⇄</button>

        <div>
          <label class="field-label" for="to">To</label>
          <div class="result-box">{{ formattedResult }}</div>
          <select class="input" id="to" style="margin-top: 0.5rem;"
                  [ngModel]="toId" (ngModelChange)="onToChange($event)">
            @for (u of units(); track u.id) {
              <option [value]="u.id">{{ u.name }} ({{ u.symbol }})</option>
            }
          </select>
        </div>
      </div>

      <div class="convert-summary">
        <span class="mono">{{ fmt(value) }} {{ fromSymbol }} = {{ formattedResult }} {{ toSymbol }}</span>
        <div class="summary-actions">
          <button class="btn btn-ghost" type="button" (click)="copyLink()">
            {{ copied() ? 'Copied!' : 'Copy link' }}
          </button>
          <button class="btn btn-ghost" type="button" (click)="toggleFavourite()">
            {{ isFav() ? '★ Saved' : '☆ Save pair' }}
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>All {{ quantity?.name?.toLowerCase() }} units</h3>
      <p style="color: var(--text-faint); font-size: 0.85rem; margin: 0 0 0.75rem;">
        {{ fmt(value) }} {{ fromSymbol }} expressed in every unit of this quantity.
      </p>
      <table>
        <thead>
          <tr><th>Unit</th><th>System</th><th style="text-align: right;">Value</th></tr>
        </thead>
        <tbody>
          @for (row of breakdown(); track row.unit.id) {
            <tr [class.highlight]="row.unit.id === toId">
              <td>{{ row.unit.name }} <span class="mono">({{ row.unit.symbol }})</span></td>
              <td><span class="badge" [class]="'badge ' + row.unit.system">{{ label(row.unit.system) }}</span></td>
              <td style="text-align: right;" class="mono">{{ fmt(row.value) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .convert-grid {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 1rem;
        align-items: start;
        margin-top: 1.25rem;
      }
      .swap { align-self: center; margin-top: 1.6rem; }
      .result-box {
        height: 42px;
        display: flex; align-items: center;
        padding: 0 0.7rem;
        background: var(--accent-soft); color: var(--accent-text);
        border-radius: var(--radius-sm);
        font-weight: 600; font-variant-numeric: tabular-nums;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .convert-summary {
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; flex-wrap: wrap;
        margin-top: 1.25rem; padding-top: 1rem;
        border-top: 1px solid var(--border);
      }
      .summary-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
      tr.highlight td { background: var(--accent-soft) !important; }
      @media (max-width: 560px) {
        .convert-grid { grid-template-columns: 1fr; }
        .swap { transform: rotate(90deg); margin: 0.25rem auto; }
      }
    `,
  ],
})
export class ConverterComponent implements OnInit {
  readonly service = inject(ConversionService);
  readonly storage = inject(StorageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly fmt = fmt;

  quantityId = '';
  fromId = '';
  toId = '';
  value = 1;
  result = 0;
  quantity?: Quantity;
  readonly copied = signal(false);

  ngOnInit(): void {
    const p = this.route.snapshot.queryParamMap;
    const qId = p.get('q');
    const q = (qId && this.service.getQuantity(qId)) || this.service.convertible[0];
    this.quantity = q;
    this.quantityId = q.id;
    this.fromId = p.get('from') && this.service.getUnit(q, p.get('from')!) ? p.get('from')! : q.units[0].id;
    this.toId = p.get('to') && this.service.getUnit(q, p.get('to')!) ? p.get('to')! : q.units[1].id;
    const v = Number(p.get('v'));
    if (!Number.isNaN(v) && p.get('v') !== null) this.value = v;
    this.recompute();
  }

  units(): Unit[] {
    return this.quantity?.units ?? [];
  }

  get fromSymbol(): string {
    return this.service.getUnit(this.quantity!, this.fromId)?.symbol ?? '';
  }
  get toSymbol(): string {
    return this.service.getUnit(this.quantity!, this.toId)?.symbol ?? '';
  }
  get formattedResult(): string {
    return fmt(this.result);
  }

  onQuantityChange(id: string): void {
    const q = this.service.getQuantity(id);
    if (!q) return;
    this.quantity = q;
    this.quantityId = id;
    this.fromId = q.units[0].id;
    this.toId = q.units[1].id;
    this.recompute();
  }

  onValueChange(v: number): void {
    this.value = Number(v);
    this.recompute();
  }
  onFromChange(id: string): void {
    this.fromId = id;
    this.recompute();
  }
  onToChange(id: string): void {
    this.toId = id;
    this.recompute();
  }

  swap(): void {
    [this.fromId, this.toId] = [this.toId, this.fromId];
    this.recompute();
  }

  private recompute(): void {
    if (!this.quantity) return;
    this.result = this.service.convert(this.quantity, this.fromId, this.toId, this.value);
    this.router.navigate([], {
      queryParams: { q: this.quantityId, from: this.fromId, to: this.toId, v: this.value },
      replaceUrl: true,
    });
    if (isFinite(this.result) && isFinite(this.value)) {
      this.storage.addHistory({
        quantityId: this.quantityId,
        fromId: this.fromId,
        toId: this.toId,
        value: this.value,
        result: this.result,
        ts: Date.now(),
      });
    }
  }

  copyLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  breakdown() {
    if (!this.quantity) return [];
    return this.service.breakdown(this.quantity, this.fromId, this.value);
  }

  isFav(): boolean {
    return this.storage.isFavourite(this.quantityId, this.fromId, this.toId);
  }

  toggleFavourite(): void {
    if (this.isFav()) {
      const fav = this.storage
        .favourites()
        .find((f) => f.quantityId === this.quantityId && f.fromId === this.fromId && f.toId === this.toId);
      if (fav) this.storage.removeFavourite(fav.id);
    } else {
      this.storage.addFavourite({
        quantityId: this.quantityId,
        fromId: this.fromId,
        toId: this.toId,
        label: `${this.fromSymbol} → ${this.toSymbol}`,
      });
    }
  }

  label(id: SystemId): string {
    return SYSTEMS.find((s) => s.id === id)?.label ?? id;
  }
}
