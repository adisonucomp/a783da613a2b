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
  private readonly alertAcknowledgementKey = 'sessionAlertAcknowledgement';
  private intervalId?: ReturnType<typeof setInterval>;
  private trackedExpirationTime?: number;
  private warnedAtFiveMinutes = false;
  private warnedAtFifteenMinutes = false;

  readonly remainingTime = signal('');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', (event) => this.handleAlertAcknowledgement(event));
    }
  }

  start(): void {
    const expiresAt = this.authSession.getExpirationTime();
    if (!isPlatformBrowser(this.platformId) || !expiresAt) {
      return;
    }

    this.stop();
    this.trackedExpirationTime = expiresAt;
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
      void this.showExpirationMessage(expiresAt);
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

  private async showFifteenMinuteWarning(): Promise<void> {
    if (this.canShowAlerts()) {
      await Swal.fire({
        allowEscapeKey: false,
        allowOutsideClick: false,
        confirmButtonText: 'Aceptar',
        icon: 'warning',
        text: 'Su sesión finalizará en aproximadamente 15 minutos.',
        title: 'Sesión próxima a expirar',
      });
      this.acknowledgeAlert('warning');
    }
  }

  private async askToExtendSession(): Promise<void> {
    if (!this.canShowAlerts()) {
      return;
    }

    const result = await Swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      cancelButtonText: 'No, continuar',
      confirmButtonColor: '#0d6efd',
      confirmButtonText: 'Sí, iniciar sesión de nuevo',
      icon: 'warning',
      showCancelButton: true,
      text: 'Para extender la sesión se debe iniciar sesión nuevamente.',
      title: 'Su sesión finaliza en 5 minutos',
    });

    if (result.isConfirmed) {
      this.acknowledgeAlert('renew');
      this.stop();
      this.authSession.clear();
      await this.router.navigate(['/login']);
    }
  }

  private async showExpirationMessage(expiresAt: number): Promise<void> {
    if (this.canShowAlerts()) {
      await Swal.fire({
        allowEscapeKey: false,
        allowOutsideClick: false,
        confirmButtonText: 'Aceptar',
        icon: 'info',
        text: 'Inicie sesión nuevamente para continuar.',
        title: 'La sesión ha finalizado',
      });
    }

    this.acknowledgeAlert('expired', expiresAt);
    void this.router.navigate(['/login']);
  }

  private canShowAlerts(): boolean {
    return isPlatformBrowser(this.platformId) && typeof window.matchMedia === 'function';
  }

  private acknowledgeAlert(type: 'expired' | 'renew' | 'warning', expiresAt = this.authSession.getExpirationTime()): void {
    if (!isPlatformBrowser(this.platformId) || !expiresAt) {
      return;
    }

    localStorage.setItem(this.alertAcknowledgementKey, JSON.stringify({ expiresAt, type, value: Date.now() }));
  }

  private handleAlertAcknowledgement(event: StorageEvent): void {
    if (event.key !== this.alertAcknowledgementKey || !event.newValue) {
      return;
    }

    try {
      const acknowledgement = JSON.parse(event.newValue) as { expiresAt?: number; type?: string };
      if (acknowledgement.expiresAt !== this.trackedExpirationTime) {
        return;
      }

      Swal.close();
      if (acknowledgement.type === 'expired' || acknowledgement.type === 'renew') {
        this.stop();
        this.authSession.clear();
        void this.router.navigate(['/login']);
      }
    } catch {
      // Ignora valores inválidos provenientes del almacenamiento compartido.
    }
  }
}
