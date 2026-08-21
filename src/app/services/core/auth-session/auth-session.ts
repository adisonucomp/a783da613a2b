import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly expiryKey = 'jwtExpiresAt';
  private readonly tokenKey = 'jwtToken';

  saveToken(token: string, expiresAt?: string): void {
    const storage = this.storage();
    storage?.setItem(this.tokenKey, token);

    if (expiresAt) {
      storage?.setItem(this.expiryKey, expiresAt);
    }
  }

  getToken(): string | null {
    return this.storage()?.getItem(this.tokenKey) ?? null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token || this.isExpired(token)) {
      this.clear();
      return false;
    }

    return true;
  }

  clear(): void {
    const storage = this.storage();
    storage?.removeItem(this.tokenKey);
    storage?.removeItem(this.expiryKey);
  }

  private storage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return environment.sessionStorage ? sessionStorage : localStorage;
  }

  private isExpired(token: string): boolean {
    const storageExpiry = this.storage()?.getItem(this.expiryKey);
    if (storageExpiry && Date.parse(storageExpiry) <= Date.now()) {
      return true;
    }

    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return true;
      }

      const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = base64Payload.padEnd(base64Payload.length + ((4 - (base64Payload.length % 4)) % 4), '=');
      const decodedPayload = JSON.parse(atob(paddedPayload)) as { exp?: number };
      return typeof decodedPayload.exp === 'number' && decodedPayload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
