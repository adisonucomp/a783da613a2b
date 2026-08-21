import { Component, inject } from '@angular/core';
import { SgC0de7562 } from '../../../services/backend/java/spring/sg-c0de7562/sg-c0de7562';
import { roleDataConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-c0de7562',
  styleUrl: './md-c0de7562.css',
  templateUrl: './md-c0de7562.html',
})
export class MdC0de7562 {
  readonly config = roleDataConfig;
  readonly service = inject(SgC0de7562);
}
