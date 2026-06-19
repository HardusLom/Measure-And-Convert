import { Injectable, signal } from '@angular/core';
import { Favourite, HistoryItem } from '../models/unit.model';

const FAV_KEY = 'measure.favourites';
const HIST_KEY = 'measure.history';
const SCORE_KEY = 'measure.bestScore';
const HISTORY_LIMIT = 25;

export type Difficulty = 'easy' | 'medium' | 'hard';
const DIFFICULTY_SCORE_KEYS: Record<Difficulty, string> = {
  easy: 'measure.bestScore.easy',
  medium: 'measure.bestScore.medium',
  hard: 'measure.bestScore.hard',
};

@Injectable({ providedIn: 'root' })
export class StorageService {
  readonly favourites = signal<Favourite[]>(this.load<Favourite[]>(FAV_KEY, []));
  readonly history = signal<HistoryItem[]>(this.load<HistoryItem[]>(HIST_KEY, []));
  /** @deprecated kept for backwards compat — use bestScores per difficulty */
  readonly bestScore = signal<number>(this.load<number>(SCORE_KEY, 0));
  readonly bestScores = {
    easy: signal<number>(this.load<number>(DIFFICULTY_SCORE_KEYS.easy, 0)),
    medium: signal<number>(this.load<number>(DIFFICULTY_SCORE_KEYS.medium, 0)),
    hard: signal<number>(this.load<number>(DIFFICULTY_SCORE_KEYS.hard, 0)),
  };

  private load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private save(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — ignore */
    }
  }

  // ---- favourites -------------------------------------------------------
  isFavourite(quantityId: string, fromId: string, toId: string): boolean {
    return this.favourites().some(
      (f) => f.quantityId === quantityId && f.fromId === fromId && f.toId === toId,
    );
  }

  addFavourite(fav: Omit<Favourite, 'id'>): void {
    if (this.isFavourite(fav.quantityId, fav.fromId, fav.toId)) return;
    const next = [...this.favourites(), { ...fav, id: crypto.randomUUID() }];
    this.favourites.set(next);
    this.save(FAV_KEY, next);
  }

  removeFavourite(id: string): void {
    const next = this.favourites().filter((f) => f.id !== id);
    this.favourites.set(next);
    this.save(FAV_KEY, next);
  }

  // ---- history ----------------------------------------------------------
  addHistory(item: HistoryItem): void {
    const current = this.history();
    const last = current[0];
    if (
      last &&
      last.quantityId === item.quantityId &&
      last.fromId === item.fromId &&
      last.toId === item.toId &&
      last.value === item.value
    ) {
      return; // skip consecutive duplicates
    }
    const next = [item, ...current].slice(0, HISTORY_LIMIT);
    this.history.set(next);
    this.save(HIST_KEY, next);
  }

  clearHistory(): void {
    this.history.set([]);
    this.save(HIST_KEY, []);
  }

  // ---- quiz score -------------------------------------------------------
  recordScore(score: number): void {
    if (score > this.bestScore()) {
      this.bestScore.set(score);
      this.save(SCORE_KEY, score);
    }
  }

  recordScoreForDifficulty(difficulty: Difficulty, score: number): void {
    const sig = this.bestScores[difficulty];
    if (score > sig()) {
      sig.set(score);
      this.save(DIFFICULTY_SCORE_KEYS[difficulty], score);
    }
  }
}
