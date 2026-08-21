import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthSession } from '../auth-session/auth-session';

@Injectable({ providedIn: 'root' })
export class SessionTimer {
  private readonly authSession = inject(AuthSession);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private intervalId?: ReturnType<typeof setInterval>;
  private warnedAtFiveMinutes = false;
  private warnedAtFifteenMinutes = false;

  readonly remainingTime = signal('');

  start(): void {
    if (!isPlatformBrowser(this.platformId) || !this.authSession.getExpirationTime()) {
      return;
    }

    this.stop();
    this.warnedAtFiveMinutes = false;
    this.warnedAtFifteenMinutes = false;
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.remainingTime.set('');
  }

  private tick(): void {
    const expiresAt = this.authSession.getExpirationTime();
    if (!expiresAt) {
      this.stop();
      return;
    }

    const millisecondsRemaining = expiresAt - Date.now();
    if (millisecondsRemaining <= 0) {
      this.stop();
      this.authSession.clear();
      this.showExpirationMessage();
      return;
    }

    this.remainingTime.set(this.formatTime(millisecondsRemaining));

    if (millisecondsRemaining <= 5 * 60_000 && !this.warnedAtFiveMinutes) {
      this.warnedAtFiveMinutes = true;
      this.askToExtendSession();
    } else if (millisecondsRemaining <= 15 * 60_000 && !this.warnedAtFifteenMinutes) {
      this.warnedAtFifteenMinutes = true;
      this.showFifteenMinuteWarning();
    }
  }

  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  }

  private showFifteenMinuteWarning(): void {
    if (this.canShowAlerts()) {
      void Swal.fire({
        icon: 'warning',
        text: 'Su sesión finalizará en aproximadamente 15 minutos.',
        title: 'Sesión próxima a expirar',
      });
    }
  }

  private async askToExtendSession(): Promise<void> {
    if (!this.canShowAlerts()) {
      return;
    }

    const result = await Swal.fire({
      cancelButtonText: 'No, continuar',
      confirmButtonColor: '#0d6efd',
      confirmButtonText: 'Sí, iniciar sesión de nuevo',
      icon: 'warning',
      showCancelButton: true,
      text: 'Para extender la sesión se debe iniciar sesión nuevamente.',
      title: 'Su sesión finaliza en 5 minutos',
    });

    if (result.isConfirmed) {
      this.stop();
      this.authSession.clear();
      await this.router.navigate(['/login']);
    }
  }

  private showExpirationMessage(): void {
    if (this.canShowAlerts()) {
      void Swal.fire({
        icon: 'info',
        text: 'Inicie sesión nuevamente para continuar.',
        title: 'La sesión ha finalizado',
      });
    }

    void this.router.navigate(['/login']);
  }

  private canShowAlerts(): boolean {
    return isPlatformBrowser(this.platformId) && typeof window.matchMedia === 'function';
  }
}
