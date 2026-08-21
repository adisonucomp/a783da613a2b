import { Routes } from '@angular/router';
import { CeLogin } from './core/ce-login/ce-login';
import { PtHome } from './web/portal/pt-home/pt-home';
import { PtRegister } from './web/portal/pt-register/pt-register';
import { PtB4c4c7b1 } from './web/portal/pt-b4c4c7b1/pt-b4c4c7b1';
import { PtC98391c6 } from './web/portal/pt-c98391c6/pt-c98391c6';
import { PtD0112a5a } from './web/portal/pt-d0112a5a/pt-d0112a5a';
import { Portal } from './web/portal/portal';
import { MdA6ac2e09 } from './web/working/md-a6ac2e09/md-a6ac2e09';
import { MdB2412519 } from './web/working/md-b2412519/md-b2412519';
import { MdB2c17bdf } from './web/working/md-b2c17bdf/md-b2c17bdf';
import { MdB4c4c7b1 } from './web/working/md-b4c4c7b1/md-b4c4c7b1';
import { MdB8043c54 } from './web/working/md-b8043c54/md-b8043c54';
import { MdB9f50faa } from './web/working/md-b9f50faa/md-b9f50faa';
import { MdC0de7562 } from './web/working/md-c0de7562/md-c0de7562';
import { MdC98391c6 } from './web/working/md-c98391c6/md-c98391c6';
import { MdD0112a5a } from './web/working/md-d0112a5a/md-d0112a5a';
import { MdD148f4b4 } from './web/working/md-d148f4b4/md-d148f4b4';
import { MdB22b6431 } from './web/working/md-b22b6431/md-b22b6431';
import { WgDashboard } from './web/working/wg-dashboard/wg-dashboard';
import { Working } from './web/working/working';
import { authGuard } from './guards/auth/auth-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'portal/home' },
  { path: 'login', component: CeLogin, },

  {
    path: 'portal', component: Portal,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: PtHome }, // Componente Inicio
      { path: 'register', component: PtRegister }, // Componente Registro
      { path: 'b4c4c7b1', component: PtB4c4c7b1 }, // Componente brand_device
      { path: 'c98391c6', component: PtC98391c6 }, // Componente brand_processor
      { path: 'd0112a5a', component: PtD0112a5a }, // Componente operating_system
    ],
  },

  {
    path: 'working', component: Working,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: WgDashboard }, // Componente Panel de Control

      { path: 'a6ac2e09', component: MdA6ac2e09 }, // Modulo graphic_card
      { path: 'b22b6431', component: MdB22b6431 }, // Modulo image_ext
      { path: 'b2412519', component: MdB2412519 }, // Modulo user_data
      { path: 'b2c17bdf', component: MdB2c17bdf }, // Modulo type_processor
      { path: 'b4c4c7b1', component: MdB4c4c7b1 }, // Modulo brand_device
      { path: 'b8043c54', component: MdB8043c54 }, // Modulo device_data
      { path: 'b9f50faa', component: MdB9f50faa }, // Modulo comment
      { path: 'c0de7562', component: MdC0de7562 }, // Modulo role_data
      { path: 'c98391c6', component: MdC98391c6 }, // Modulo brand_processor
      { path: 'd0112a5a', component: MdD0112a5a }, // Modulo operating_system
      { path: 'd148f4b4', component: MdD148f4b4 }, // Modulo device_image
    ],
  },

  { path: '**', redirectTo: '' },
];
