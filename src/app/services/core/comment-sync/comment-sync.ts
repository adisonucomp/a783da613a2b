import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export interface CommentSyncEvent {
  deviceId: number;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class CommentSync {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly channelName = 'portal-comments';
  private readonly storageKey = 'portalCommentSynchronization';
  private channel?: BroadcastChannel;

  readonly latest = signal<CommentSyncEvent | null>(null);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.document.defaultView?.addEventListener('storage', (event) => {
      if (event.key === this.storageKey && event.newValue) this.receive(event.newValue);
    });

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.addEventListener('message', (event: MessageEvent<CommentSyncEvent>) => this.receive(event.data));
    }
  }

  publish(deviceId: number): void {
    if (!isPlatformBrowser(this.platformId) || !Number.isInteger(deviceId) || deviceId <= 0) return;

    const event: CommentSyncEvent = { deviceId, value: Date.now() };
    this.channel?.postMessage(event);
    try {
      this.document.defaultView?.localStorage.setItem(this.storageKey, JSON.stringify(event));
    } catch {
      // BroadcastChannel remains available when storage access is restricted.
    }
  }

  private receive(value: CommentSyncEvent | string): void {
    let event: unknown = value;
    if (typeof value === 'string') {
      try {
        event = JSON.parse(value);
      } catch {
        return;
      }
    }
    if (!event || typeof event !== 'object') return;

    const { deviceId, value: timestamp } = event as Partial<CommentSyncEvent>;
    if (typeof deviceId !== 'number' || !Number.isInteger(deviceId) || deviceId <= 0 || typeof timestamp !== 'number') return;

    this.latest.set({ deviceId, value: timestamp });
  }
}
