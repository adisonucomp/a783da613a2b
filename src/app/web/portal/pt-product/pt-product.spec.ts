import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PtProduct } from './pt-product';

describe('PtProduct', () => {
  let component: PtProduct;
  let fixture: ComponentFixture<PtProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PtProduct],
    }).compileComponents();

    fixture = TestBed.createComponent(PtProduct);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
