import { Component, inject, signal, computed } from '@angular/core';
import { ConversionService } from '../../services/conversion.service';
import { StorageService, Difficulty } from '../../services/storage.service';
import { Quantity, Unit, SYSTEMS } from '../../models/unit.model';
import { fmt } from '../../shared/format.util';

interface Option {
  text: string;
  correct: boolean;
}
interface Question {
  prompt: string;
  hint?: string;
  options: Option[];
}

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy',   label: 'Easy',   desc: 'Name → symbol recognition' },
  { id: 'medium', label: 'Medium', desc: 'Mixed: symbols, quantities, systems, conversions' },
  { id: 'hard',   label: 'Hard',   desc: 'Numeric conversions with close distractors' },
];

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
})
export class QuizComponent {
  readonly service = inject(ConversionService);
  readonly storage = inject(StorageService);
  readonly keys = ['A', 'B', 'C', 'D'];
  readonly difficulties = DIFFICULTIES;

  readonly categories: string[] = [
    'All categories',
    ...[...new Set(this.service.quantities.map(q => q.category))],
  ];

  readonly difficulty = signal<Difficulty>('easy');
  readonly selectedCategory = signal<string>('All categories');
  readonly score = signal(0);
  readonly answered = signal(0);
  readonly streak = signal(0);
  readonly chosen = signal<number | null>(null);
  readonly revealed = signal(false);
  readonly lastCorrect = signal(false);
  readonly q = signal<Question>(this.generate());

  readonly bestScore = computed(() => this.storage.bestScores[this.difficulty()]());
  readonly diffLabel = computed(() => DIFFICULTIES.find((d) => d.id === this.difficulty())!.label);

  setDifficulty(d: Difficulty): void {
    if (d === this.difficulty()) return;
    this.difficulty.set(d);
    this.resetState();
  }

  setCategory(cat: string): void {
    if (cat === this.selectedCategory()) return;
    this.selectedCategory.set(cat);
    this.resetState();
  }

  choose(i: number): void {
    if (this.revealed()) return;
    this.chosen.set(i);
    this.revealed.set(true);
    const correct = this.q().options[i].correct;
    this.lastCorrect.set(correct);
    this.answered.update((n) => n + 1);
    if (correct) {
      this.score.update((n) => n + 1);
      this.streak.update((n) => n + 1);
      this.storage.recordScoreForDifficulty(this.difficulty(), this.score());
    } else {
      this.streak.set(0);
    }
  }

  next(): void {
    this.chosen.set(null);
    this.revealed.set(false);
    this.q.set(this.generate());
  }

  reset(): void {
    this.resetState();
  }

  // ---- helpers -------------------------------------------------------------

  private rand<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private resetState(): void {
    this.score.set(0);
    this.answered.set(0);
    this.streak.set(0);
    this.chosen.set(null);
    this.revealed.set(false);
    this.q.set(this.generate());
  }

  private filteredQuantities(): Quantity[] {
    const cat = this.selectedCategory();
    if (cat === 'All categories') return this.service.quantities;
    return this.service.quantities.filter(q => q.category === cat);
  }

  private filteredConvertible(): Quantity[] {
    return this.filteredQuantities().filter(q => q.units.length >= 2);
  }

  private allUnits(): { q: Quantity; u: Unit }[] {
    return this.filteredQuantities().flatMap((q) => q.units.map((u) => ({ q, u })));
  }

  // ---- question generation -------------------------------------------------

  private generate(): Question {
    switch (this.difficulty()) {
      case 'easy':
        return this.symbolQuestion();
      case 'hard':
        return this.hardConversionQuestion();
      default: {
        const kind = Math.floor(Math.random() * 4);
        switch (kind) {
          case 0: return this.symbolQuestion();
          case 1: return this.quantityQuestion();
          case 2: return this.systemQuestion();
          default: return this.conversionQuestion();
        }
      }
    }
  }

  private symbolQuestion(): Question {
    const pool = this.allUnits();
    const target = this.rand(pool);
    const distractors = this.shuffle(pool.filter((x) => x.u.symbol !== target.u.symbol))
      .slice(0, 3)
      .map((x) => x.u.symbol);
    const options = this.shuffle([
      { text: target.u.symbol, correct: true },
      ...distractors.map((d) => ({ text: d, correct: false })),
    ]);
    return { prompt: `What is the symbol for the ${target.u.name}?`, hint: `Quantity: ${target.q.name}`, options };
  }

  private quantityQuestion(): Question {
    const pool = this.allUnits();
    const target = this.rand(pool);
    const allQuantities = this.service.quantities;
    const others = this.shuffle(allQuantities.filter((q) => q.id !== target.q.id))
      .slice(0, 3)
      .map((q) => q.name);
    const options = this.shuffle([
      { text: target.q.name, correct: true },
      ...others.map((o) => ({ text: o, correct: false })),
    ]);
    return { prompt: `Which quantity does the ${target.u.name} (${target.u.symbol}) measure?`, options };
  }

  private systemQuestion(): Question {
    const pool = this.allUnits();
    const target = this.rand(pool);
    const correct = SYSTEMS.find((s) => s.id === target.u.system)!;
    const others = this.shuffle(SYSTEMS.filter((s) => s.id !== correct.id)).slice(0, 3);
    const options = this.shuffle([
      { text: correct.label, correct: true },
      ...others.map((o) => ({ text: o.label, correct: false })),
    ]);
    return { prompt: `Which measurement system is the ${target.u.name} (${target.u.symbol}) part of?`, options };
  }

  private conversionQuestion(): Question {
    const convertible = this.filteredConvertible();
    const pool = convertible.length >= 1 ? convertible : this.service.convertible;
    const q = this.rand(pool);
    const [from, to] = this.shuffle(q.units).slice(0, 2);
    const value = this.rand([1, 2, 5, 10, 25, 100]);
    const answer = this.service.convert(q, from.id, to.id, value);
    const wrongs = new Set<string>();
    const fAnswer = fmt(answer);
    let guard = 0;
    while (wrongs.size < 3 && guard < 50) {
      guard++;
      const factor = this.rand([0.1, 0.5, 2, 10, 0.25, 4]);
      const candidate = fmt(answer * factor);
      if (candidate !== fAnswer) wrongs.add(candidate);
    }
    const options = this.shuffle([
      { text: `${fAnswer} ${to.symbol}`, correct: true },
      ...[...wrongs].map((w) => ({ text: `${w} ${to.symbol}`, correct: false })),
    ]);
    return { prompt: `Convert ${value} ${from.symbol} to ${to.name} (${to.symbol}).`, hint: `Quantity: ${q.name}`, options };
  }

  private hardConversionQuestion(): Question {
    const convertible = this.filteredConvertible();
    const pool = convertible.length >= 1 ? convertible : this.service.convertible;
    const q = this.rand(pool);
    const [from, to] = this.shuffle(q.units).slice(0, 2);
    const value = this.rand([1, 2, 5, 10, 25, 100]);
    const answer = this.service.convert(q, from.id, to.id, value);
    const fAnswer = fmt(answer);

    const perturbations = [
      1.05, 0.95, 1.12, 0.88, 1.20, 0.80, 1.35, 0.65, 1.08, 0.92,
    ];
    const wrongs = new Set<string>();
    let guard = 0;
    while (wrongs.size < 3 && guard < 60) {
      guard++;
      const factor = this.rand(perturbations);
      const candidate = fmt(answer * factor);
      if (candidate !== fAnswer) wrongs.add(candidate);
    }
    if (wrongs.size < 3) {
      const step = Math.abs(answer) < 1e-6 ? 1 : answer;
      for (const delta of [0.1, -0.1, 0.3, -0.3, 0.5]) {
        if (wrongs.size >= 3) break;
        const candidate = fmt(answer + step * delta);
        if (candidate !== fAnswer) wrongs.add(candidate);
      }
    }

    const options = this.shuffle([
      { text: `${fAnswer} ${to.symbol}`, correct: true },
      ...[...wrongs].map((w) => ({ text: `${w} ${to.symbol}`, correct: false })),
    ]);
    return {
      prompt: `Convert ${value} ${from.symbol} to ${to.name} (${to.symbol}).`,
      hint: `Quantity: ${q.name}`,
      options,
    };
  }
}
