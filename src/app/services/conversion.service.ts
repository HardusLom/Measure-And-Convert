import { Injectable } from '@angular/core';
import { QUANTITIES, SI_PREFIXES, FORMULAS } from '../data/units.data';
import { Quantity, Unit } from '../models/unit.model';

@Injectable({ providedIn: 'root' })
export class ConversionService {
  readonly quantities = QUANTITIES;
  readonly prefixes = SI_PREFIXES;
  readonly formulas = FORMULAS;

  /** Quantities the converter offers (need at least two units). */
  get convertible(): Quantity[] {
    return this.quantities.filter((q) => q.units.length >= 2);
  }

  getQuantity(id: string): Quantity | undefined {
    return this.quantities.find((q) => q.id === id);
  }

  getUnit(q: Quantity, unitId: string): Unit | undefined {
    return q.units.find((u) => u.id === unitId);
  }

  private toBase(u: Unit, value: number): number {
    return value * u.factor + (u.offset ?? 0);
  }

  private fromBase(u: Unit, base: number): number {
    return (base - (u.offset ?? 0)) / u.factor;
  }

  /** Convert `value` from one unit to another within the same quantity. */
  convert(q: Quantity, fromId: string, toId: string, value: number): number {
    const from = this.getUnit(q, fromId);
    const to = this.getUnit(q, toId);
    if (!from || !to) return NaN;
    return this.fromBase(to, this.toBase(from, value));
  }

  /** Value of `value` (in `fromId`) expressed in every unit of the quantity. */
  breakdown(q: Quantity, fromId: string, value: number): { unit: Unit; value: number }[] {
    const from = this.getUnit(q, fromId);
    if (!from) return [];
    const base = this.toBase(from, value);
    return q.units.map((u) => ({ unit: u, value: this.fromBase(u, base) }));
  }
}
