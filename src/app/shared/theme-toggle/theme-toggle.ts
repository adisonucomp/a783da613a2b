import { Component, inject } from '@angular/core';
import { Theme, ThemeMode } from '../../services/core/theme/theme';

@Component({
  imports: [],
  selector: 'app-theme-toggle',
  styleUrl: './theme-toggle.css',
  templateUrl: './theme-toggle.html',
})
export class ThemeToggle {
  readonly theme = inject(Theme);

  setTheme(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }
}
