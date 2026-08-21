import { Component } from '@angular/core';
import { WgNavbar } from "../../shared/working/wg-navbar/wg-navbar";
import { WgSidebar } from "../../shared/working/wg-sidebar/wg-sidebar";
import { RouterOutlet } from "@angular/router";
import { WgFooter } from "../../shared/working/wg-footer/wg-footer";

@Component({
  imports: [WgNavbar, WgSidebar, RouterOutlet, WgFooter],
  selector: 'app-working',
  styleUrl: './working.css',
  templateUrl: './working.html',
})
export class Working { }
