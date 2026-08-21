import { Component, inject } from '@angular/core';
import { SgB8043c54 } from '../../../services/backend/java/spring/sg-b8043c54/sg-b8043c54';
import { deviceDataConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-b8043c54',
  styleUrl: './md-b8043c54.css',
  templateUrl: './md-b8043c54.html',
})
export class MdB8043c54 {
  readonly config = deviceDataConfig;
  readonly service = inject(SgB8043c54);
}
