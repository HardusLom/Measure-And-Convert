import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConversionService } from '../../services/conversion.service';
import { SiPrefix } from '../../models/unit.model';
import { fmt } from '../../shared/format.util';

@Component({
  selector: 'app-prefixes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './prefixes.component.html',
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
