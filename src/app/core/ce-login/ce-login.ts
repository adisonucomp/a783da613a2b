import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SgAuth } from '../../services/backend/java/spring/sg-auth/sg-auth';
import { AuthSession } from '../../services/core/auth-session/auth-session';
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
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.nonNullable.group({
    fdLogin: ['', Validators.required],
    fdPassd: ['', Validators.required],
  });

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: ({ data }) => {
        this.authSession.saveToken(data.token);

        void this.router.navigate(['/working/dashboard']);
      },
      error: () => {
        void Swal.fire({
          icon: 'error',
          title: 'Credenciales Invalidas',
        });
      },
    });
  }
}
