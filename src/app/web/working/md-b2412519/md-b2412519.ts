import { Component, inject } from '@angular/core';
import { SgB2412519 } from '../../../services/backend/java/spring/sg-b2412519/sg-b2412519';
import { userDataConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-b2412519',
  styleUrl: './md-b2412519.css',
  templateUrl: './md-b2412519.html',
})
export class MdB2412519 {
  readonly config = userDataConfig;
  readonly service = inject(SgB2412519);
}
