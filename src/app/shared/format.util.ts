/**
 * Format a number for display:
 *  - trims floating-point noise,
 *  - uses scientific notation at extremes,
 *  - groups thousands with a thin space, period as decimal separator.
 * Kept locale-neutral so output never clashes with <input type="number">.
 */
export function fmt(n: number, sig = 7): string {
  if (n === null || n === undefined || !isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs < 1e-4 || abs >= 1e12) {
    return n
      .toExponential(4)
      .replace(/\.?0+e/, 'e')
      .replace('e+', 'e');
  }
  const rounded = parseFloat(n.toPrecision(sig));
  return group(rounded.toString());
}

function group(s: string): string {
  const [intPart, decPart] = s.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  return decPart ? `${grouped}.${decPart}` : grouped;
}
