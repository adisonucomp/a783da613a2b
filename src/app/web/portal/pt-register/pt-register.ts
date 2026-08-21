import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RegisterBuyerPayload, SgAuth } from '../../../services/backend/java/spring/sg-auth/sg-auth';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-pt-register',
  styleUrl: './pt-register.css',
  templateUrl: './pt-register.html',
})
export class PtRegister {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(SgAuth);
  private readonly router = inject(Router);

  readonly registerForm = this.formBuilder.nonNullable.group({
    fdEmail: ['', [Validators.required, Validators.email]],
    fdLogin: ['', Validators.required],
    fdPassd: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassd: ['', Validators.required],
    fdName: ['', Validators.required],
    fdSrnm: ['', Validators.required],
  });

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { confirmPassd, ...payload } = this.registerForm.getRawValue();

    if (payload.fdPassd !== confirmPassd) {
      void Swal.fire({
        allowEscapeKey: false,
        allowOutsideClick: false,
        confirmButtonText: 'Aceptar',
        icon: 'error',
        title: 'Las contraseñas no coinciden',
      });
      return;
    }

    this.authService.registerBuyer(payload satisfies RegisterBuyerPayload).subscribe({
      next: () => {
        void Swal.fire({
          allowEscapeKey: false,
          allowOutsideClick: false,
          confirmButtonText: 'Aceptar',
          icon: 'success',
          title: 'Registro completado',
          text: 'Ahora puedes iniciar sesión.',
        }).then(() => this.router.navigate(['/login']));
      },
      error: () => {
        void Swal.fire({
          allowEscapeKey: false,
          allowOutsideClick: false,
          confirmButtonText: 'Aceptar',
          icon: 'error',
          title: 'No fue posible completar el registro',
        });
      },
    });
  }
}
