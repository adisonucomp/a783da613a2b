import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WgSidebar {
  readonly visible = signal(true);

  toggle(): void {
    this.visible.update((visible) => !visible);
  }
}
