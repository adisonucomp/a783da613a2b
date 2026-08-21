import { Component, inject } from '@angular/core';
import { SgB2c17bdf } from '../../../services/backend/java/spring/sg-b2c17bdf/sg-b2c17bdf';
import { typeProcessorConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-b2c17bdf',
  styleUrl: './md-b2c17bdf.css',
  templateUrl: './md-b2c17bdf.html',
})
export class MdB2c17bdf {
  readonly config = typeProcessorConfig;
  readonly service = inject(SgB2c17bdf);
}
