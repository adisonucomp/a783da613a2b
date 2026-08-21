import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';

interface JwtPayload {
  authorities?: unknown;
  exp?: number;
  fdLogin?: unknown;
  login?: unknown;
  preferred_username?: unknown;
  role?: unknown;
  roleDataId?: unknown;
  roleId?: unknown;
  roles?: unknown;
  sub?: unknown;
  username?: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly expiryKey = 'jwtExpiresAt';
  private readonly tokenKey = 'jwtToken';

  readonly stateVersion = signal(0);

  saveToken(token: string, expiresAt?: string): void {
    const storage = this.storage();
    storage?.setItem(this.tokenKey, token);
    this.setSessionMarker(true);

    if (expiresAt) {
      storage?.setItem(this.expiryKey, expiresAt);
    } else {
      storage?.removeItem(this.expiryKey);
    }
    this.stateVersion.update((version) => version + 1);
  }

  getToken(): string | null {
    return this.storage()?.getItem(this.tokenKey) ?? null;
  }

  getExpirationTime(): number | null {
    const storedExpiry = this.storage()?.getItem(this.expiryKey);
    if (storedExpiry) {
      const time = Date.parse(storedExpiry);
      if (!Number.isNaN(time)) {
        return time;
      }
    }

    const payload = this.getPayload();
    return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
  }

  isAuthenticated(): boolean {
    this.stateVersion();
    const token = this.getToken();
    return !!token && !this.isExpired(token);
  }

  isAdministrator(): boolean {
    return this.isAuthenticated() && this.getRoleId() === 1;
  }

  getUserName(): string | null {
    const payload = this.getPayload();
    const userName = payload?.preferred_username ?? payload?.username ?? payload?.fdLogin ?? payload?.login ?? payload?.sub;
    return typeof userName === 'string' && userName.trim() ? userName : null;
  }

  clear(): void {
    const storage = this.storage();
    storage?.removeItem(this.tokenKey);
    storage?.removeItem(this.expiryKey);
    this.setSessionMarker(false);
    this.stateVersion.update((version) => version + 1);
  }

  private storage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return environment.sessionStorage ? sessionStorage : localStorage;
  }

  private setSessionMarker(authenticated: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (authenticated) {
      this.document.documentElement.setAttribute('data-session', 'authenticated');
    } else {
      this.document.documentElement.removeAttribute('data-session');
    }
  }

  private isExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    const expirationTime = this.getExpirationTime();
    return !payload || (expirationTime !== null && expirationTime <= Date.now());
  }

  private getRoleId(): number | null {
    const payload = this.getPayload();
    if (!payload) {
      return null;
    }

    return this.toRoleId(payload.roleDataId)
      ?? this.toRoleId(payload.roleId)
      ?? this.toRoleId(payload.role)
      ?? this.toRoleId(payload.roles)
      ?? this.toRoleId(payload.authorities);
  }

  private getPayload(): JwtPayload | null {
    const token = this.getToken();
    return token ? this.decodeToken(token) : null;
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = base64Payload.padEnd(base64Payload.length + ((4 - (base64Payload.length % 4)) % 4), '=');
      return JSON.parse(atob(paddedPayload)) as JwtPayload;
    } catch {
      return null;
    }
  }

  private toRoleId(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value)) {
      return value;
    }

    if (typeof value === 'string') {
      if (/^\d+$/.test(value)) {
        return Number(value);
      }

      return value.toUpperCase().includes('ADMIN') ? 1 : null;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const roleId = this.toRoleId(item);
        if (roleId !== null) {
          return roleId;
        }
      }
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      return this.toRoleId(record['idRegister']) ?? this.toRoleId(record['id']) ?? this.toRoleId(record['roleId']);
    }

    return null;
  }
}
