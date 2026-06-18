import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConversionService } from '../../services/conversion.service';
import { Formula } from '../../models/unit.model';

@Component({
  selector: 'app-formulas',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Formulas</h2>
    <p class="page-intro">
      Common relationships between the quantities in this app, with each variable and its SI unit.
      Search by name, area, or symbol.
    </p>

    <div class="card">
      <input class="input" type="search" placeholder="Search formulas…"
             [ngModel]="term()" (ngModelChange)="term.set($event)" />
      <div class="chip-row" style="margin-top: 0.9rem;">
        <button class="chip" [class.active]="area() === 'all'" (click)="area.set('all')">All areas</button>
        @for (a of areas; track a) {
          <button class="chip" [class.active]="area() === a" (click)="area.set(a)">{{ a }}</button>
        }
      </div>
    </div>

    <div class="formula-grid">
      @for (f of filtered(); track f.name) {
        <div class="card formula">
          <div class="formula-head">
            <h3>{{ f.name }}</h3>
            <span class="badge other">{{ f.area }}</span>
          </div>
          <div class="expr mono">{{ f.expression }}</div>
          <p class="desc">{{ f.description }}</p>
          <table>
            <tbody>
              @for (v of f.variables; track v.sym) {
                <tr>
                  <td class="mono" style="width: 18%;">{{ v.sym }}</td>
                  <td>{{ v.meaning }}</td>
                  <td class="mono" style="text-align: right; width: 22%;">{{ v.unit }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (filtered().length === 0) {
      <div class="empty">No formulas match your search.</div>
    }
  `,
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
