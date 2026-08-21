import { Component, inject } from '@angular/core';
import { SgB22b6431 } from '../../../services/backend/java/spring/sg-b22b6431/sg-b22b6431';
import { imageExtConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-b22b6431',
  styleUrl: './md-b22b6431.css',
  templateUrl: './md-b22b6431.html',
})
export class MdB22b6431 {
  readonly config = imageExtConfig;
  readonly service = inject(SgB22b6431);
}
