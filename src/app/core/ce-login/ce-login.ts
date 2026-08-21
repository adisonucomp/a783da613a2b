import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { SgAuth } from '../../services/backend/java/spring/sg-auth/sg-auth';
import { AuthSession } from '../../services/core/auth-session/auth-session';
import { SessionTimer } from '../../services/core/session-timer/session-timer';
import { PtFooter } from '../../shared/portal/pt-footer/pt-footer';
import { PtNavbar } from '../../shared/portal/pt-navbar/pt-navbar';

@Component({
  imports: [ReactiveFormsModule, PtNavbar, PtFooter],
  selector: 'app-ce-login',
  styleUrl: './ce-login.css',
  templateUrl: './ce-login.html',
})
export class CeLogin {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(SgAuth);
  private readonly authSession = inject(AuthSession);
  private readonly sessionTimer = inject(SessionTimer);
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.nonNullable.group({
    fdLogin: ['', Validators.required],
    fdPassd: ['', Validators.required],
  });
  readonly loading = signal(false);

  submit(): void {
    if (this.loginForm.invalid || this.loading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.login(this.loginForm.getRawValue()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: ({ data }) => {
        this.authSession.saveToken(data.token, data.expiresAt);
        this.sessionTimer.synchronizeAuthenticatedSession(data.token, data.expiresAt);

        void this.router.navigate([this.authSession.isAdministrator() ? '/working/dashboard' : '/portal/home']);
      },
      error: () => {
        void Swal.fire({
          allowEscapeKey: false,
          allowOutsideClick: false,
          confirmButtonText: 'Aceptar',
          icon: 'error',
          title: 'Credenciales Invalidas',
        });
      },
    });
  }
}
