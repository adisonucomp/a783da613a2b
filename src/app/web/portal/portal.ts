import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PtNavbar } from '../../shared/portal/pt-navbar/pt-navbar';

@Component({
  imports: [PtNavbar, RouterOutlet],
  selector: 'app-portal',
  styleUrl: './portal.css',
  templateUrl: './portal.html',
})
export class Portal {}
