import { Component } from '@angular/core';
import { PtCategoryProducts } from '../../../shared/portal/pt-category-products/pt-category-products';

@Component({
  imports: [PtCategoryProducts],
  selector: 'app-pt-a6ac2e09',
  styleUrl: './pt-a6ac2e09.css',
  templateUrl: './pt-a6ac2e09.html',
})
export class PtA6ac2e09 {
  readonly category = 'graphic-card' as const;
  readonly title = 'Tarjetas Gráficas';
}
