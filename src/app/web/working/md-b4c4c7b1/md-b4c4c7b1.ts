import { Component, inject } from '@angular/core';
import { SgB4c4c7b1 } from '../../../services/backend/java/spring/sg-b4c4c7b1/sg-b4c4c7b1';
import { brandDeviceConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-b4c4c7b1',
  styleUrl: './md-b4c4c7b1.css',
  templateUrl: './md-b4c4c7b1.html',
})
export class MdB4c4c7b1 {
  readonly config = brandDeviceConfig;
  readonly service = inject(SgB4c4c7b1);
}
