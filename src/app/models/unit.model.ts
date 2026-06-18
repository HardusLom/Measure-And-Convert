export type SystemId = 'si' | 'metric' | 'imperial' | 'us' | 'other';

export interface SystemMeta {
  id: SystemId;
  label: string;
}

export const SYSTEMS: SystemMeta[] = [
  { id: 'si', label: 'SI' },
  { id: 'metric', label: 'Metric' },
  { id: 'imperial', label: 'Imperial' },
  { id: 'us', label: 'US customary' },
  { id: 'other', label: 'Other' },
];

export interface Unit {
  /** stable, unique within a quantity (used for binding + lookups) */
  id: string;
  name: string;
  symbol: string;
  system: SystemId;
  /**
   * Conversion to the quantity's base unit:
   *   base = value * factor + (offset ?? 0)
   * offset is only non-zero for affine scales (temperature).
   */
  factor: number;
  offset?: number;
}

export interface Quantity {
  id: string;
  name: string;
  /** quantity symbol, e.g. 'm' for mass, 'F' for force */
  symbol: string;
  category: string;
  /** symbol of the base unit used internally */
  baseSymbol: string;
  units: Unit[];
}

export interface Formula {
  name: string;
  expression: string;
  description: string;
  area: string;
  variables: { sym: string; meaning: string; unit: string }[];
}

export interface SiPrefix {
  name: string;
  symbol: string;
  exponent: number;
}

export interface Favourite {
  id: string;
  quantityId: string;
  fromId: string;
  toId: string;
  label: string;
}

export interface HistoryItem {
  quantityId: string;
  fromId: string;
  toId: string;
  value: number;
  result: number;
  ts: number;
}
