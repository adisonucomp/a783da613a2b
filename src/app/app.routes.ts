import { Routes } from '@angular/router';
import { WoExternal } from './working/wo-external/wo-external';
import { ExLogin } from './working/wo-external/ex-login/ex-login';
import { WoModule } from './working/wo-module/wo-module';
import { MdA6ac2e09 } from './working/wo-module/md-a6ac2e09/md-a6ac2e09';
import { MdB2412519 } from './working/wo-module/md-b2412519/md-b2412519';
import { MdB2c17bdf } from './working/wo-module/md-b2c17bdf/md-b2c17bdf';
import { MdB4c4c7b1 } from './working/wo-module/md-b4c4c7b1/md-b4c4c7b1';
import { MdB8043c54 } from './working/wo-module/md-b8043c54/md-b8043c54';
import { MdB9f50faa } from './working/wo-module/md-b9f50faa/md-b9f50faa';
import { MdC0de7562 } from './working/wo-module/md-c0de7562/md-c0de7562';
import { MdC98391c6 } from './working/wo-module/md-c98391c6/md-c98391c6';
import { MdD0112a5a } from './working/wo-module/md-d0112a5a/md-d0112a5a';
import { MdD148f4b4 } from './working/wo-module/md-d148f4b4/md-d148f4b4';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '' },

  {
    path: 'ex', component: WoExternal,
    children: [
      { path: 'login', component: ExLogin }
    ],
  },
  {
    path: 'md', component: WoModule,
    children: [
      { path: 'b4c4c7b1', component: MdB4c4c7b1 }, // Modulo brand_device
      { path: 'c98391c6', component: MdC98391c6 }, // Modulo brand_processor
      { path: 'b2c17bdf', component: MdB2c17bdf }, // Modulo type_processor
      { path: 'a6ac2e09', component: MdA6ac2e09 }, // Modulo graphic_card
      { path: 'd0112a5a', component: MdD0112a5a }, // Modulo operating_system
      { path: 'b8043c54', component: MdB8043c54 }, // Modulo device
      { path: 'd148f4b4', component: MdD148f4b4 }, // Modulo image
      { path: 'c0de7562', component: MdC0de7562 }, // Modulo role
      { path: 'b2412519', component: MdB2412519 }, // Modulo user
      { path: 'b9f50faa', component: MdB9f50faa }, // Modulo comment
    ],
  },

  { path: '**', redirectTo: '' },
];
