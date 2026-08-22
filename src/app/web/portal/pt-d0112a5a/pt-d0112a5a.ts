import { Component } from '@angular/core';
import { PtCategoryProducts } from '../../../shared/portal/pt-category-products/pt-category-products';

@Component({
  imports: [PtCategoryProducts],
  selector: 'app-pt-d0112a5a',
  styleUrl: './pt-d0112a5a.css',
  templateUrl: './pt-d0112a5a.html',
})
export class PtD0112a5a {
  readonly category = 'operating-system' as const;
  readonly title = 'Sistemas Operativos';
}
