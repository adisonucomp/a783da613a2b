import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthSession } from '../../../services/core/auth-session/auth-session';
import { SessionTimer } from '../../../services/core/session-timer/session-timer';
import { ThemeToggle } from '../../theme-toggle/theme-toggle';
import { WgSidebar as WgSidebarService } from '../../../services/working/wg-sidebar/wg-sidebar';

@Component({
  imports: [RouterLink, ThemeToggle],
  selector: 'app-wg-navbar',
  styleUrl: './wg-navbar.css',
  templateUrl: './wg-navbar.html',
})
export class WgNavbar implements OnInit {
  readonly sidebarState = inject(WgSidebarService);
  readonly authSession = inject(AuthSession);
  readonly sessionTimer = inject(SessionTimer);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.sessionTimer.start();
  }

  async logout(): Promise<void> {
    const result = await Swal.fire({
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#0d6efd',
      icon: 'warning',
      showCancelButton: true,
      title: '¿Desea cerrar sesión?',
    });

    if (result.isConfirmed) {
      this.sessionTimer.stop();
      this.authSession.clear();
      await this.router.navigate(['/login']);
    }
  }
}
