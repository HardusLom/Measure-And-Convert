import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <div class="brand">
        <span class="brand-mark">±</span>
        <div>
          <h1>Measure</h1>
          <p>Units, quantities &amp; conversions</p>
        </div>
      </div>
      <button class="menu-toggle" type="button" (click)="menuOpen.set(!menuOpen())"
              [attr.aria-expanded]="menuOpen()" aria-label="Toggle menu">☰</button>
      <nav class="app-nav" [class.open]="menuOpen()">
        @for (item of nav; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active"
             (click)="menuOpen.set(false)">
            <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>{{ item.label }}
          </a>
        }
      </nav>
    </header>

    <main class="app-main">
      <router-outlet />
    </main>

    <footer class="app-footer">
      <span>Built with Angular {{ angularVersion }} · all conversions use exact factors where defined.</span>
    </footer>
  `,
})
export class AppComponent {
  readonly angularVersion = '18';
  readonly menuOpen = signal(false);

  readonly nav: NavItem[] = [
    { path: 'reference', label: 'Reference', icon: '☰' },
    { path: 'converter', label: 'Converter', icon: '⇄' },
    { path: 'prefixes', label: 'Prefixes', icon: '×10ⁿ' },
    { path: 'formulas', label: 'Formulas', icon: 'ƒ' },
    { path: 'quiz', label: 'Quiz', icon: '?' },
    { path: 'saved', label: 'Saved', icon: '★' },
  ];
}
