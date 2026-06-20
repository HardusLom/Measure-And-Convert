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
  styleUrl: './prefixes.component.css',
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
