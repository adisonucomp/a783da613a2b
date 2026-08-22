import { Component } from '@angular/core';
import { PtCategoryProducts } from '../../../shared/portal/pt-category-products/pt-category-products';

@Component({
  imports: [PtCategoryProducts],
  selector: 'app-pt-b4c4c7b1',
  styleUrl: './pt-b4c4c7b1.css',
  templateUrl: './pt-b4c4c7b1.html',
})
export class PtB4c4c7b1 {
  readonly category = 'brand-device' as const;
  readonly title = 'Marcas de Dispositivos';
}
