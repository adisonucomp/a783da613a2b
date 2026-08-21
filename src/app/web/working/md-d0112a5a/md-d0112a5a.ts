import { Component, inject } from '@angular/core';
import { SgD0112a5a } from '../../../services/backend/java/spring/sg-d0112a5a/sg-d0112a5a';
import { operatingSystemConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-d0112a5a',
  styleUrl: './md-d0112a5a.css',
  templateUrl: './md-d0112a5a.html',
})
export class MdD0112a5a {
  readonly config = operatingSystemConfig;
  readonly service = inject(SgD0112a5a);
}
