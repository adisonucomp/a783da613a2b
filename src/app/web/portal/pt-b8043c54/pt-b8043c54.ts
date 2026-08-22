import { Component } from '@angular/core';
import { PtCategoryProducts } from '../../../shared/portal/pt-category-products/pt-category-products';

@Component({
  imports: [PtCategoryProducts],
  selector: 'app-pt-b8043c54',
  styleUrl: './pt-b8043c54.css',
  templateUrl: './pt-b8043c54.html',
})
export class PtB8043c54 {
  readonly category = 'device-data' as const;
  readonly title = 'Dispositivos';
}
