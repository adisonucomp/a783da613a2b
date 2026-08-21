import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { SgAuth } from '../../backend/java/spring/sg-auth/sg-auth';
import { AuthSession } from '../auth-session/auth-session';

interface SessionSyncEvent {
  expiresAt?: string;
  token?: string;
  type: 'authenticated' | 'logout' | 'refreshed';
  value: number;
}

@Injectable({ providedIn: 'root' })
export class SessionTimer {
  private readonly authService = inject(SgAuth);
  private readonly authSession = inject(AuthSession);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly alertAcknowledgementKey = 'sessionAlertAcknowledgement';
  private readonly sessionSyncKey = 'sessionSynchronization';
  private intervalId?: ReturnType<typeof setInterval>;
  private lastSessionSyncValue?: number;
  private syncChannel?: BroadcastChannel;
  private trackedExpirationTime?: number;
  private warnedAtFiveMinutes = false;
  private warnedAtFifteenMinutes = false;

  readonly remainingTime = signal('');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', (event) => this.handleAlertAcknowledgement(event));
      window.addEventListener('storage', (event) => this.handleSessionSynchronizationStorage(event));

      if (typeof BroadcastChannel !== 'undefined') {
        this.syncChannel = new BroadcastChannel('application-session');
        this.syncChannel.addEventListener('message', (event: MessageEvent<SessionSyncEvent>) => {
          this.handleSessionSynchronization(event.data);
        });
      }
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

  logout(): void {
    this.endSession(true);
  }

  synchronizeAuthenticatedSession(token: string, expiresAt: string): void {
    this.publishSessionSynchronization({
      expiresAt,
      token,
      type: 'authenticated',
      value: Date.now(),
    });
    this.start();
  }

  private tick(): void {
    const expiresAt = this.authSession.getExpirationTime();
    if (!expiresAt) {
      this.stop();
      return;
    }

    const millisecondsRemaining = expiresAt - Date.now();
    if (millisecondsRemaining <= 0) {
      this.endSession(true);
      void this.showExpirationMessage(expiresAt);
      return;
    }

    this.remainingTime.set(this.formatTime(millisecondsRemaining));

    if (millisecondsRemaining <= 5 * 60_000 && !this.warnedAtFiveMinutes) {
      this.warnedAtFiveMinutes = true;
      void this.askToExtendSession();
    } else if (millisecondsRemaining <= 15 * 60_000 && !this.warnedAtFifteenMinutes) {
      this.warnedAtFifteenMinutes = true;
      void this.showFifteenMinuteWarning();
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
    if (!this.canShowAlerts()) {
      return;
    }

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

  private async askToExtendSession(): Promise<void> {
    if (!this.canShowAlerts()) {
      return;
    }

    const result = await Swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      cancelButtonText: 'Continuar',
      confirmButtonColor: '#0d6efd',
      confirmButtonText: 'Extender',
      icon: 'warning',
      showCancelButton: true,
      text: 'La sesión se extenderá sin interrumpir su trabajo.',
      title: 'Su sesión finaliza en 5 minutos',
    });

    if (result.isConfirmed) {
      this.acknowledgeAlert('extend');
      await this.extendSession();
    } else {
      this.acknowledgeAlert('continue');
    }
  }

  private async extendSession(): Promise<void> {
    const token = this.authSession.getToken();
    if (!token) {
      this.endSession(true);
      return;
    }

    this.showProcessing('Extendiendo sesión...');
    try {
      const { data } = await firstValueFrom(this.authService.refresh(token));
      this.authSession.saveToken(data.token, data.expiresAt);
      this.publishSessionSynchronization({
        expiresAt: data.expiresAt,
        token: data.token,
        type: 'refreshed',
        value: Date.now(),
      });
      this.start();
      this.closeAlert();
      await Swal.fire({
        allowEscapeKey: false,
        allowOutsideClick: false,
        confirmButtonText: 'Aceptar',
        icon: 'success',
        title: 'Sesión extendida',
      });
    } catch {
      this.closeAlert();
      const expiresAt = this.authSession.getExpirationTime() ?? Date.now();
      this.endSession(true);
      await this.showExpirationMessage(expiresAt);
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

  private endSession(synchronize: boolean): void {
    const expiresAt = this.authSession.getExpirationTime();
    this.stop();
    this.authSession.clear();
    this.closeAlert();
    if (synchronize) {
      this.publishSessionSynchronization({ type: 'logout', value: Date.now() });
    }
    this.acknowledgeAlert('expired', expiresAt);
    void this.router.navigate(['/login']);
  }

  private canShowAlerts(): boolean {
    return isPlatformBrowser(this.platformId) && typeof window.matchMedia === 'function';
  }

  private acknowledgeAlert(type: 'continue' | 'expired' | 'extend' | 'warning', expiresAt = this.authSession.getExpirationTime()): void {
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

      this.closeAlert();
      if (acknowledgement.type === 'expired') {
        this.stop();
        this.authSession.clear();
        this.navigateToLoginIfWorkingRoute();
      }
    } catch {
      // Ignora valores inválidos provenientes del almacenamiento compartido.
    }
  }

  private handleSessionSynchronizationStorage(event: StorageEvent): void {
    if (event.key !== this.sessionSyncKey || !event.newValue) {
      return;
    }

    try {
      this.handleSessionSynchronization(JSON.parse(event.newValue) as SessionSyncEvent);
    } catch {
      // Ignora valores inválidos provenientes del almacenamiento compartido.
    }
  }

  private handleSessionSynchronization(event: SessionSyncEvent): void {
    if (!event?.type || event.value === this.lastSessionSyncValue) {
      return;
    }
    this.lastSessionSyncValue = event.value;
    this.closeAlert();

    if (event.type === 'logout') {
      this.stop();
      this.authSession.clear();
      this.navigateToLoginIfWorkingRoute();
      return;
    }

    if (event.token && event.expiresAt) {
      this.authSession.saveToken(event.token, event.expiresAt);
      this.start();
      return;
    }

    if (event.type === 'authenticated') {
      return;
    }

    // En producción el token permanece en sessionStorage. Cada pestaña renueva
    // su propio token sin transferirlo al almacenamiento compartido.
    void this.extendSessionInCurrentContext();
  }

  private async extendSessionInCurrentContext(): Promise<void> {
    const token = this.authSession.getToken();
    if (!token) {
      this.endSession(false);
      return;
    }

    try {
      const { data } = await firstValueFrom(this.authService.refresh(token));
      this.authSession.saveToken(data.token, data.expiresAt);
      this.start();
    } catch {
      this.endSession(false);
    }
  }

  private publishSessionSynchronization(event: SessionSyncEvent): void {
    this.lastSessionSyncValue = event.value;
    this.syncChannel?.postMessage(event);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storageEvent = environment.sessionStorage && (event.type === 'authenticated' || event.type === 'refreshed')
      ? { ...event, token: undefined }
      : event;
    localStorage.setItem(this.sessionSyncKey, JSON.stringify(storageEvent));
  }

  private showProcessing(text: string): void {
    if (!this.canShowAlerts()) {
      return;
    }

    void Swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      text,
      title: 'Procesando',
    });
  }

  private closeAlert(): void {
    if (this.canShowAlerts()) {
      Swal.close();
    }
  }

  private navigateToLoginIfWorkingRoute(): void {
    if (this.router.url.startsWith('/working')) {
      void this.router.navigate(['/login']);
    }
  }
}
