import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConversionService } from '../../services/conversion.service';
import { StorageService } from '../../services/storage.service';
import { Quantity, Unit, SystemId, SYSTEMS } from '../../models/unit.model';
import { fmt } from '../../shared/format.util';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './converter.component.html',
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
      .formula-row {
        display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap;
        margin-top: 0.85rem; padding-top: 0.85rem;
        border-top: 1px solid var(--border);
        font-size: 0.875rem;
      }
      .formula-label { color: var(--text-faint); white-space: nowrap; }
      .formula-expr { color: var(--text); }
      .vis-section {
        display: flex; flex-direction: column; gap: 0.55rem;
        margin-top: 0.85rem; padding-top: 0.85rem;
        border-top: 1px solid var(--border);
      }
      .vis-label { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-faint); }
      .vis-bars { display: flex; flex-direction: column; gap: 0.5rem; }
      .vis-row { display: flex; align-items: center; gap: 0.75rem; }
      .vis-unit-name { font-size: 0.82rem; color: var(--text-muted); white-space: nowrap; min-width: 9ch; text-align: right; }
      .vis-track { flex: 1; height: 18px; background: var(--surface-2); border-radius: 4px; overflow: hidden; }
      .vis-bar { height: 100%; border-radius: 4px; transition: width 0.35s cubic-bezier(0.4,0,0.2,1); min-width: 2px; }
      .vis-bar--from { background: var(--accent); }
      .vis-bar--to { background: var(--accent-text); opacity: 0.55; }
      .vis-ratio { font-size: 0.82rem; color: var(--text-muted); }
      .vis-ratio strong { color: var(--text); }
      tr.highlight td { background: var(--accent-soft) !important; }
      .compare-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
      .view-toggle { display: flex; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; }
      .toggle-btn {
        padding: 0.35rem 0.85rem; font-size: 0.82rem; font-weight: 500;
        background: none; border: none; cursor: pointer;
        color: var(--text-faint); transition: background 0.12s, color 0.12s;
      }
      .toggle-btn.active { background: var(--accent-soft); color: var(--accent-text); }
      .compare-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .compare-card {
        display: flex; flex-direction: column; align-items: flex-start; gap: 0.2rem;
        padding: 0.85rem;
        border: 1px solid var(--border); border-radius: var(--radius-sm);
        background: var(--surface);
      }
      .compare-card--active { border-color: var(--accent); background: var(--accent-soft); }
      .compare-val { font-size: 1.15rem; font-weight: 700; color: var(--text); line-height: 1.2; word-break: break-all; }
      .compare-card--active .compare-val { color: var(--accent-text); }
      .compare-sym { font-size: 0.9rem; color: var(--text-faint); }
      .compare-name { font-size: 0.78rem; color: var(--text-faint); margin-top: 0.15rem; }
      .converter-layout {
        display: flex; gap: 1.25rem; align-items: flex-start;
      }
      .converter-layout > .card { flex: 1; min-width: 0; margin-top: 0; }
      .chain-card { display: flex; flex-direction: column; }
      .chain-flow { display: flex; flex-direction: column; align-items: flex-start; gap: 0; flex: 1; }
      .chain-node {
        display: flex; flex-direction: column; gap: 0.3rem;
        padding: 0.85rem 1rem;
        border: 1px solid var(--border); border-radius: var(--radius-sm);
        width: 100%; box-sizing: border-box;
      }
      .chain-start { background: var(--accent-soft); }
      .chain-val { font-size: 1.2rem; font-weight: 700; color: var(--accent-text); }
      .chain-unit-label { font-size: 0.85rem; color: var(--text-faint); }
      .chain-controls { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.3rem; }
      .chain-select { flex: 1; margin: 0; }
      .chain-connector { padding: 0.1rem 1.1rem; }
      .chain-arrow { font-size: 1.3rem; color: var(--text-faint); line-height: 1; }
      @media (max-width: 720px) {
        .converter-layout { flex-direction: column; }
        .converter-layout > .card + .card { margin-top: 1.25rem; }
        .convert-grid { grid-template-columns: 1fr; }
        .swap { transform: rotate(90deg); margin: 0.25rem auto; }
      }
    `,
  ],
})
export class ConverterComponent implements OnInit, OnDestroy {
  readonly service = inject(ConversionService);
  readonly storage = inject(StorageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly fmt = fmt;

  quantityId = '';
  fromId = '';
  toId = '';
  value = 1;
  result = 0;
  quantity?: Quantity;
  readonly copied = signal(false);
  readonly chainSteps = signal<string[]>([]);
  readonly viewMode = signal<'cards' | 'table'>('cards');

  private paramSub?: Subscription;

  private defaultFrom(q: Quantity): string {
    return q.units.find(u => u.factor === 1 && (u.offset ?? 0) === 0)?.id ?? q.units[0].id;
  }

  private defaultTo(q: Quantity, fromId: string): string {
    const idx = q.units.findIndex(u => u.id === fromId);
    const after = q.units.slice(idx + 1).find(u => u.id !== fromId);
    if (after) return after.id;
    return q.units.find(u => u.id !== fromId)?.id ?? q.units[1 % q.units.length].id;
  }

  ngOnInit(): void {
    this.paramSub = this.route.queryParamMap.subscribe((p) => {
      const qId = p.get('q');
      const q = (qId && this.service.getQuantity(qId)) || this.service.convertible[0];
      const newFrom = p.get('from') && this.service.getUnit(q, p.get('from')!) ? p.get('from')! : this.defaultFrom(q);
      const newTo = p.get('to') && this.service.getUnit(q, p.get('to')!) ? p.get('to')! : this.defaultTo(q, newFrom);
      const v = Number(p.get('v'));
      const quantityChanged = this.quantityId !== q.id;
      this.quantity = q;
      this.quantityId = q.id;
      this.fromId = newFrom;
      this.toId = newTo;
      if (!Number.isNaN(v) && p.get('v') !== null) this.value = v;
      if (quantityChanged) this.chainSteps.set([]);
      this.recompute();
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
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
    this.fromId = this.defaultFrom(q);
    this.toId = this.defaultTo(q, this.fromId);
    this.chainSteps.set([]);
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

  selectToUnit(id: string): void {
    this.toId = id;
    if (!this.quantity) return;
    this.result = this.service.convert(this.quantity, this.fromId, this.toId, this.value);
    const url = this.router.serializeUrl(
      this.router.createUrlTree([], {
        queryParams: { q: this.quantityId, from: this.fromId, to: this.toId, v: this.value },
      })
    );
    this.location.replaceState(url);
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

  get fromUnit(): Unit | undefined {
    return this.quantity ? this.service.getUnit(this.quantity, this.fromId) : undefined;
  }

  visualiser(): { fromName: string; toName: string; fromPct: number; toPct: number; ratioLabel: string } | null {
    const from = this.quantity ? this.service.getUnit(this.quantity, this.fromId) : undefined;
    const to = this.quantity ? this.service.getUnit(this.quantity, this.toId) : undefined;
    if (!from || !to || (from.offset ?? 0) !== 0 || (to.offset ?? 0) !== 0) return null;
    if (from.id === to.id) return null;
    const max = Math.max(from.factor, to.factor);
    const fromPct = (from.factor / max) * 100;
    const toPct = (to.factor / max) * 100;
    const ratio = from.factor / to.factor;
    const ratioLabel = ratio >= 1000 || ratio < 0.001
      ? ratio.toExponential(3)
      : parseFloat(ratio.toPrecision(4)).toString();
    return { fromName: from.name, toName: to.name, fromPct, toPct, ratioLabel };
  }

  get formulaExplainer(): string {
    const from = this.quantity ? this.service.getUnit(this.quantity, this.fromId) : undefined;
    const to = this.quantity ? this.service.getUnit(this.quantity, this.toId) : undefined;
    if (!from || !to) return '';
    if (from.id === to.id) return `${to.symbol} = ${from.symbol}`;

    const coeff = (n: number) => parseFloat(n.toPrecision(6)).toString();
    const A = from.factor / to.factor;
    const B = ((from.offset ?? 0) - (to.offset ?? 0)) / to.factor;

    if (Math.abs(B) < 1e-9) {
      return `${to.symbol} = ${from.symbol} × ${coeff(A)}`;
    }
    const sign = B > 0 ? '+' : '−';
    const absB = coeff(Math.abs(B));
    if (Math.abs(A - 1) < 1e-9) {
      return `${to.symbol} = ${from.symbol} ${sign} ${absB}`;
    }
    return `${to.symbol} = (${from.symbol} × ${coeff(A)}) ${sign} ${absB}`;
  }

  chainValue(unitId: string): number {
    if (!this.quantity) return NaN;
    return this.service.convert(this.quantity, this.fromId, unitId, this.value);
  }

  addChainStep(): void {
    const used = new Set([this.fromId, ...this.chainSteps()]);
    const next = this.units().find((u) => !used.has(u.id));
    if (next) this.chainSteps.update((s) => [...s, next.id]);
  }

  updateChainStep(i: number, unitId: string): void {
    this.chainSteps.update((s) => s.map((id, idx) => (idx === i ? unitId : id)));
  }

  removeChainStep(i: number): void {
    this.chainSteps.update((s) => s.filter((_, idx) => idx !== i));
  }

  label(id: SystemId): string {
    return SYSTEMS.find((s) => s.id === id)?.label ?? id;
  }
}
