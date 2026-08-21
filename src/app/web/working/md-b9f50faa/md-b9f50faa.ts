import { Component, inject } from '@angular/core';
import { SgB9f50faa } from '../../../services/backend/java/spring/sg-b9f50faa/sg-b9f50faa';
import { commentConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-b9f50faa',
  styleUrl: './md-b9f50faa.css',
  templateUrl: './md-b9f50faa.html',
})
export class MdB9f50faa {
  readonly config = commentConfig;
  readonly service = inject(SgB9f50faa);
}
