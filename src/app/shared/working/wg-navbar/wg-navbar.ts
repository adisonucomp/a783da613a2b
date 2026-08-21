import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WgSidebar as WgSidebarService } from '../../../services/working/wg-sidebar/wg-sidebar';

@Component({
  imports: [RouterLink],
  selector: 'app-wg-navbar',
  styleUrl: './wg-navbar.css',
  templateUrl: './wg-navbar.html',
})
export class WgNavbar {
  constructor(readonly sidebarState: WgSidebarService) {}
}
