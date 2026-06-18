import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'reference' },
  {
    path: 'reference',
    title: 'Reference · Measure',
    loadComponent: () =>
      import('./pages/reference/reference.component').then((m) => m.ReferenceComponent),
  },
  {
    path: 'converter',
    title: 'Converter · Measure',
    loadComponent: () =>
      import('./pages/converter/converter.component').then((m) => m.ConverterComponent),
  },
  {
    path: 'prefixes',
    title: 'SI prefixes · Measure',
    loadComponent: () =>
      import('./pages/prefixes/prefixes.component').then((m) => m.PrefixesComponent),
  },
  {
    path: 'formulas',
    title: 'Formulas · Measure',
    loadComponent: () =>
      import('./pages/formulas/formulas.component').then((m) => m.FormulasComponent),
  },
  {
    path: 'quiz',
    title: 'Quiz · Measure',
    loadComponent: () => import('./pages/quiz/quiz.component').then((m) => m.QuizComponent),
  },
  {
    path: 'saved',
    title: 'Saved · Measure',
    loadComponent: () => import('./pages/saved/saved.component').then((m) => m.SavedComponent),
  },
  { path: '**', redirectTo: 'reference' },
];
