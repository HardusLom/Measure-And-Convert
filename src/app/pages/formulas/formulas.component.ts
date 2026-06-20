import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConversionService } from '../../services/conversion.service';
import { Formula } from '../../models/unit.model';

@Component({
  selector: 'app-formulas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './formulas.component.html',
  styleUrl: './formulas.component.css',
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

  constructor() {
    inject(ActivatedRoute).queryParamMap.subscribe(params => {
      const search = params.get('search');
      if (search) {
        this.area.set('all');
        this.term.set(search);
      }
    });
  }
}
