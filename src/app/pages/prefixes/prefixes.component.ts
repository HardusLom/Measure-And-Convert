import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConversionService } from '../../services/conversion.service';
import { SiPrefix } from '../../models/unit.model';
import { fmt } from '../../shared/format.util';

@Component({
  selector: 'app-prefixes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>SI prefix scaler</h2>
    <p class="page-intro">
      Enter a value with a prefix and a base unit — see it expressed across every SI prefix from
      yotta (10²⁴) down to yocto (10⁻²⁴).
    </p>

    <div class="card">
      <div class="prefix-input">
        <div>
          <label class="field-label" for="val">Value</label>
          <input id="val" class="input" type="number" inputmode="decimal"
                 [ngModel]="value" (ngModelChange)="value = +$event" />
        </div>
        <div>
          <label class="field-label" for="pfx">Prefix</label>
          <select id="pfx" class="input" [(ngModel)]="prefixSymbol">
            @for (p of prefixes; track p.symbol) {
              <option [value]="p.symbol">{{ p.name }} ({{ p.symbol || '—' }}, 10<sup>{{ p.exponent }}</sup>)</option>
            }
          </select>
        </div>
        <div>
          <label class="field-label" for="unit">Base unit</label>
          <input id="unit" class="input" type="text" [(ngModel)]="unit" placeholder="e.g. m, g, W, B" />
        </div>
      </div>
      <p class="restated mono">
        = {{ fmt(baseValue()) }} {{ unit }} &nbsp;(in the base unit)
      </p>
    </div>

    <div class="card" style="padding: 0.6rem 1rem;">
      <table>
        <thead>
          <tr>
            <th>Prefix</th><th>Symbol</th><th>Power</th><th style="text-align: right;">Value</th>
          </tr>
        </thead>
        <tbody>
          @for (p of prefixes; track p.symbol) {
            <tr [class.highlight]="p.symbol === prefixSymbol">
              <td>{{ p.name }}</td>
              <td class="mono">{{ p.symbol || '—' }}{{ unit }}</td>
              <td class="mono">10<sup>{{ p.exponent }}</sup></td>
              <td style="text-align: right;" class="mono">{{ fmt(valueAt(p)) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .prefix-input {
        display: grid;
        grid-template-columns: 1fr 1.4fr 1fr;
        gap: 1rem;
      }
      .restated { margin: 1rem 0 0; color: var(--accent-text); font-weight: 600; }
      tr.highlight td { background: var(--accent-soft) !important; }
      sup { font-size: 0.7em; }
      @media (max-width: 560px) {
        .prefix-input { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class PrefixesComponent {
  readonly service = inject(ConversionService);
  readonly prefixes = this.service.prefixes;
  readonly fmt = fmt;

  value = 1;
  prefixSymbol = 'k';
  unit = 'm';

  private exponentOf(symbol: string): number {
    return this.prefixes.find((p) => p.symbol === symbol)?.exponent ?? 0;
  }

  baseValue(): number {
    return this.value * Math.pow(10, this.exponentOf(this.prefixSymbol));
  }

  valueAt(p: SiPrefix): number {
    return this.baseValue() / Math.pow(10, p.exponent);
  }
}
