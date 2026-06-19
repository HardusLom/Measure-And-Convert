import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConversionService } from '../../services/conversion.service';
import { Formula } from '../../models/unit.model';

@Component({
  selector: 'app-formulas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './formulas.component.html',
  styles: [
    `
      .formula-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.25rem;
        margin-top: 1.25rem;
      }
      .formula-grid .card { margin-top: 0; }
      .formula-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
      .formula-head h3 { margin: 0; }
      .expr {
        font-size: 1.15rem;
        padding: 0.6rem 0.8rem;
        margin: 0.75rem 0;
        background: var(--surface-2);
        border-radius: var(--radius-sm);
        text-align: center;
      }
      .desc { color: var(--text-muted); font-size: 0.9rem; margin: 0 0 0.75rem; }
    `,
  ],
})
export class FormulasComponent {
  readonly service = inject(ConversionService);
  readonly term = signal('');
  readonly area = signal<string>('all');

  readonly areas = [...new Set(this.service.formulas.map((f) => f.area))];

  readonly filtered = computed<Formula[]>(() => {
    const q = this.term().trim().toLowerCase();
    const area = this.area();
    return this.service.formulas.filter((f) => {
      const matchArea = area === 'all' || f.area === area;
      const matchTerm =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.area.toLowerCase().includes(q) ||
        f.expression.toLowerCase().includes(q) ||
        f.variables.some((v) => v.sym.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q));
      return matchArea && matchTerm;
    });
  });
}
