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
  template: `
    <h2>Quiz</h2>
    <p class="page-intro">
      Test your recall of units, symbols, systems and conversions. Questions are generated from the
      same dataset that powers the reference and converter.
    </p>

    <div class="diff-bar">
      @for (d of difficulties; track d.id) {
        <button class="diff-btn"
                [class.active]="difficulty() === d.id"
                [title]="d.desc"
                (click)="setDifficulty(d.id)">
          {{ d.label }}
        </button>
      }
    </div>

    <div class="scorebar card">
      <div><span class="score-label">Score</span><span class="score-val">{{ score() }}</span></div>
      <div><span class="score-label">Answered</span><span class="score-val">{{ answered() }}</span></div>
      <div><span class="score-label">Streak</span><span class="score-val">{{ streak() }}</span></div>
      <div><span class="score-label">Best</span><span class="score-val">{{ bestScore() }}</span></div>
    </div>

    <div class="card">
      <div class="diff-badge diff-{{ difficulty() }}">{{ diffLabel() }}</div>
      <p class="prompt">{{ q().prompt }}</p>
      @if (q().hint) { <p class="hint mono">{{ q().hint }}</p> }

      <div class="options">
        @for (opt of q().options; track opt.text; let i = $index) {
          <button class="opt"
                  [class.correct]="revealed() && opt.correct"
                  [class.wrong]="revealed() && chosen() === i && !opt.correct"
                  [disabled]="revealed()"
                  (click)="choose(i)">
            <span class="opt-key">{{ keys[i] }}</span>{{ opt.text }}
          </button>
        }
      </div>

      @if (revealed()) {
        <div class="feedback" [class.good]="lastCorrect()" [class.bad]="!lastCorrect()">
          {{ lastCorrect() ? '✓ Correct' : '✗ Not quite' }}
          <button class="btn btn-primary" type="button" (click)="next()">Next question →</button>
        </div>
      }
    </div>

    <button class="btn btn-ghost" type="button" (click)="reset()" style="margin-top: 1rem;">Reset score</button>
  `,
  styles: [
    `
      .diff-bar { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
      .diff-btn {
        flex: 1; padding: 0.45rem 0.75rem;
        background: var(--surface); color: var(--text-muted);
        border: 1px solid var(--border-strong); border-radius: var(--radius-sm);
        font-size: 0.875rem; font-weight: 500; cursor: pointer;
        transition: background 0.12s, color 0.12s, border-color 0.12s;
      }
      .diff-btn:hover { background: var(--surface-2); color: var(--text); }
      .diff-btn.active { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
      .diff-badge {
        display: inline-block; padding: 0.15rem 0.55rem;
        border-radius: var(--radius-sm); font-size: 0.7rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.07em;
        margin-bottom: 0.6rem;
      }
      .diff-easy   { background: #d1fae5; color: #065f46; }
      .diff-medium { background: #fef3c7; color: #92400e; }
      .diff-hard   { background: #fee2e2; color: #991b1b; }
      @media (prefers-color-scheme: dark) {
        .diff-easy   { background: #064e3b; color: #6ee7b7; }
        .diff-medium { background: #78350f; color: #fcd34d; }
        .diff-hard   { background: #7f1d1d; color: #fca5a5; }
      }
      .scorebar { display: flex; gap: 1rem; justify-content: space-around; text-align: center; }
      .score-label { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-faint); }
      .score-val { font-size: 1.5rem; font-weight: 700; font-variant-numeric: tabular-nums; }
      .prompt { font-size: 1.15rem; font-weight: 500; margin: 0 0 0.25rem; }
      .hint { color: var(--text-muted); margin: 0 0 1rem; }
      .options { display: grid; gap: 0.6rem; margin-top: 1rem; }
      .opt {
        display: flex; align-items: center; gap: 0.7rem;
        text-align: left; width: 100%;
        padding: 0.75rem 0.9rem;
        background: var(--surface); color: var(--text);
        border: 1px solid var(--border-strong); border-radius: var(--radius-sm);
        font-size: 0.95rem; cursor: pointer; transition: background 0.12s, border-color 0.12s;
      }
      .opt:hover:not(:disabled) { background: var(--surface-2); }
      .opt:disabled { cursor: default; }
      .opt-key {
        display: grid; place-items: center;
        width: 24px; height: 24px; flex: none;
        background: var(--surface-2); border-radius: 5px;
        font-size: 0.78rem; font-weight: 700; color: var(--text-muted);
      }
      .opt.correct { border-color: var(--accent); background: var(--accent-soft); color: var(--accent-text); }
      .opt.wrong { border-color: var(--danger); background: var(--danger-soft); color: var(--danger); }
      .feedback {
        display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
        margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border);
        font-weight: 600;
      }
      .feedback.good { color: var(--accent-text); }
      .feedback.bad { color: var(--danger); }
    `,
  ],
})
export class QuizComponent {
  readonly service = inject(ConversionService);
  readonly storage = inject(StorageService);
  readonly keys = ['A', 'B', 'C', 'D'];
  readonly difficulties = DIFFICULTIES;

  readonly difficulty = signal<Difficulty>('easy');
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

  // ---- question generation ---------------------------------------------
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

  private allUnits(): { q: Quantity; u: Unit }[] {
    return this.service.quantities.flatMap((q) => q.units.map((u) => ({ q, u })));
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
    const others = this.shuffle(this.service.quantities.filter((q) => q.id !== target.q.id))
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
    const convertible = this.service.convertible;
    const q = this.rand(convertible);
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

  // Hard mode: only numeric conversions, distractors are within ±5–35% of the correct answer
  private hardConversionQuestion(): Question {
    const convertible = this.service.convertible;
    const q = this.rand(convertible);
    const [from, to] = this.shuffle(q.units).slice(0, 2);
    const value = this.rand([1, 2, 5, 10, 25, 100]);
    const answer = this.service.convert(q, from.id, to.id, value);
    const fAnswer = fmt(answer);

    // Close perturbation factors — within 5–35% offset
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
    // Fallback: if answer is near zero some perturbations produce same fmt — use additive noise
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
