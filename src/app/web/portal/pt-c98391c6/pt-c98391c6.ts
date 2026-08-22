import { Component } from '@angular/core';
import { PtCategoryProducts } from '../../../shared/portal/pt-category-products/pt-category-products';

@Component({
  imports: [PtCategoryProducts],
  selector: 'app-pt-c98391c6',
  styleUrl: './pt-c98391c6.css',
  templateUrl: './pt-c98391c6.html',
})
export class PtC98391c6 {
  readonly category = 'brand-processor' as const;
  readonly title = 'Marcas de Procesadores';
}
