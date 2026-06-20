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
  styleUrl: './converter.component.css',
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
  readonly resultCopied = signal(false);
  readonly chainSteps = signal<string[]>([]);
  readonly viewMode = signal<'cards' | 'table'>('cards');

  private paramSub?: Subscription;

  // Compound unit chains: quantity id → ordered unit-id chains (largest → smallest)
  private readonly COMPOUND_CHAINS: Record<string, string[][]> = {
    length: [['ft', 'in']],
    mass:   [['st', 'lb'], ['lb', 'oz']],
    time:   [['wk', 'd'], ['d', 'h', 'min', 's'], ['h', 'min', 's'], ['min', 's']],
    angle:  [['deg', 'arcmin', 'arcsec']],
  };

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

  /** Rounded result for display in the to-input (avoids raw float noise). */
  get displayResult(): number | '' {
    if (!isFinite(this.result)) return '';
    return parseFloat(this.result.toPrecision(7));
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

  onToValueChange(v: number | string): void {
    const num = +v;
    if (!isFinite(num) || !this.quantity) return;
    this.result = num;
    this.value = this.service.convert(this.quantity, this.toId, this.fromId, num);
    this.router.navigate([], {
      queryParams: { q: this.quantityId, from: this.fromId, to: this.toId, v: this.value },
      replaceUrl: true,
    });
    if (isFinite(this.value)) {
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

  // ---- Compound units -------------------------------------------------------

  /** Returns a compound breakdown string (e.g. "5 ft 9 in") when the to-unit
   *  is the first in a known compound chain and the result has a sub-unit part. */
  compoundResult(): string | null {
    if (!this.quantity) return null;
    const chains = this.COMPOUND_CHAINS[this.quantityId];
    if (!chains) return null;
    const chain = chains.find(c => c[0] === this.toId);
    if (!chain) return null;
    return this.buildCompound(chain, this.result);
  }

  private buildCompound(chain: string[], value: number): string | null {
    const q = this.quantity!;
    const isNeg = value < 0;
    let rem = Math.abs(value);
    const parts: string[] = [];

    for (let i = 0; i < chain.length - 1; i++) {
      const whole = Math.floor(rem);
      const frac = rem - whole;
      const sym = this.service.getUnit(q, chain[i])?.symbol;
      if (!sym) return null;
      if (i === 0) {
        parts.push(`${isNeg ? -whole : whole} ${sym}`);
      } else if (whole !== 0) {
        parts.push(`${whole} ${sym}`);
      }
      rem = this.service.convert(q, chain[i], chain[i + 1], frac);
    }

    const lastUnit = this.service.getUnit(q, chain[chain.length - 1]);
    if (!lastUnit) return null;
    const lastVal = parseFloat(rem.toPrecision(6));
    if (lastVal !== 0) parts.push(`${lastVal} ${lastUnit.symbol}`);

    // Only useful if we have at least two parts (a whole + sub-unit)
    return parts.length >= 2 ? parts.join(' ') : null;
  }

  // ---- Copy actions ---------------------------------------------------------

  copyLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  copyResult(): void {
    const compound = this.compoundResult();
    const text = compound ?? `${this.formattedResult} ${this.toSymbol}`;
    navigator.clipboard.writeText(text).then(() => {
      this.resultCopied.set(true);
      setTimeout(() => this.resultCopied.set(false), 2000);
    });
  }

  // ---- Breakdown / chain ----------------------------------------------------

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
