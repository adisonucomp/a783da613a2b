import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PtA6ac2e09 } from './pt-a6ac2e09';

describe('PtA6ac2e09', () => {
  let component: PtA6ac2e09;
  let fixture: ComponentFixture<PtA6ac2e09>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PtA6ac2e09],
    }).compileComponents();

    fixture = TestBed.createComponent(PtA6ac2e09);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
