import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthSession } from '../../../services/core/auth-session/auth-session';
import { WgSidebar as WgSidebarService } from '../../../services/working/wg-sidebar/wg-sidebar';

@Component({
  imports: [RouterLink],
  selector: 'app-wg-navbar',
  styleUrl: './wg-navbar.css',
  templateUrl: './wg-navbar.html',
})
export class WgNavbar {
  readonly sidebarState = inject(WgSidebarService);
  private readonly authSession = inject(AuthSession);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    const result = await Swal.fire({
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, cerrar sesión',
      confirmButtonColor: '#0d6efd',
      icon: 'warning',
      showCancelButton: true,
      title: '¿Desea cerrar sesión?',
    });

    if (result.isConfirmed) {
      this.authSession.clear();
      await this.router.navigate(['/login']);
    }
  }
}
