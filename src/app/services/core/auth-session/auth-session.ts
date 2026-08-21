import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly tokenKey = 'jwtToken';

  saveToken(token: string): void {
    this.storage()?.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return this.storage()?.getItem(this.tokenKey) ?? null;
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  clear(): void {
    this.storage()?.removeItem(this.tokenKey);
  }

  private storage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return environment.sessionStorage ? sessionStorage : localStorage;
  }
}
