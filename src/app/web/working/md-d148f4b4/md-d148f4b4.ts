import { Component, inject } from '@angular/core';
import { SgD148f4b4 } from '../../../services/backend/java/spring/sg-d148f4b4/sg-d148f4b4';
import { deviceImageConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-d148f4b4',
  styleUrl: './md-d148f4b4.css',
  templateUrl: './md-d148f4b4.html',
})
export class MdD148f4b4 {
  readonly config = deviceImageConfig;
  readonly service = inject(SgD148f4b4);
}
