import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ThemeMode = 'auto' | 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'themeMode';

  readonly mode = signal<ThemeMode>('auto');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const storedMode = this.storage()?.getItem(this.storageKey);
      if (storedMode === 'auto' || storedMode === 'dark' || storedMode === 'light') {
        this.mode.set(storedMode);
      }
      this.apply();
      this.document.defaultView?.addEventListener('storage', (event) => {
        if (event.key !== this.storageKey) {
          return;
        }

        const synchronizedMode = event.newValue;
        if (synchronizedMode === 'auto' || synchronizedMode === 'dark' || synchronizedMode === 'light') {
          this.mode.set(synchronizedMode);
          this.apply();
        }
      });
    }
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    if (isPlatformBrowser(this.platformId)) {
      this.storage()?.setItem(this.storageKey, mode);
      this.apply();
    }
  }

  private apply(): void {
    const prefersDarkTheme = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const selectedTheme = this.mode() === 'auto' ? prefersDarkTheme ? 'dark' : 'light' : this.mode();

    this.document.documentElement.setAttribute('data-bs-theme', selectedTheme);
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }
}
