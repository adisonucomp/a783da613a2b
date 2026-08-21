import { Component, inject } from '@angular/core';
import { SgA6ac2e09 } from '../../../services/backend/java/spring/sg-a6ac2e09/sg-a6ac2e09';
import { graphicCardConfig } from '../../../shared/working/wg-crud-table/wg-crud-config';
import { WgCrudTable } from '../../../shared/working/wg-crud-table/wg-crud-table';

@Component({
  imports: [WgCrudTable],
  selector: 'app-md-a6ac2e09',
  styleUrl: './md-a6ac2e09.css',
  templateUrl: './md-a6ac2e09.html',
})
export class MdA6ac2e09 {
  readonly config = graphicCardConfig;
  readonly service = inject(SgA6ac2e09);
}
