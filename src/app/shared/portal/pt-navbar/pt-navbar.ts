import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthSession } from '../../../services/core/auth-session/auth-session';
import { SessionTimer } from '../../../services/core/session-timer/session-timer';
import { ThemeToggle } from '../../theme-toggle/theme-toggle';

@Component({
  imports: [RouterLink, RouterLinkActive, ThemeToggle],
  selector: 'app-pt-navbar',
  styleUrl: './pt-navbar.css',
  templateUrl: './pt-navbar.html',
})
export class PtNavbar implements OnInit {
  readonly authSession = inject(AuthSession);
  readonly sessionTimer = inject(SessionTimer);

  ngOnInit(): void {
    this.sessionTimer.start();
  }

  async logout(): Promise<void> {
    const result = await Swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#0d6efd',
      icon: 'warning',
      showCancelButton: true,
      title: '¿Desea cerrar sesión?',
    });

    if (result.isConfirmed) {
      this.sessionTimer.logout();
    }
  }
}
