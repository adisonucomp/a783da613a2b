import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { WgSidebar as WgSidebarService } from '../../../services/working/wg-sidebar/wg-sidebar';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-wg-sidebar',
  styleUrl: './wg-sidebar.css',
  templateUrl: './wg-sidebar.html',
})
export class WgSidebar {
  constructor(readonly sidebarState: WgSidebarService) {}
}
