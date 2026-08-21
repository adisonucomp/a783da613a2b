import { Component, inject } from '@angular/core';
import { SgC98391c6 } from '../../../services/backend/java/spring/sg-c98391c6/sg-c98391c6';
import { brandProcessorConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-c98391c6',
  styleUrl: './md-c98391c6.css',
  templateUrl: './md-c98391c6.html',
})
export class MdC98391c6 {
  readonly config = brandProcessorConfig;
  readonly service = inject(SgC98391c6);
}
