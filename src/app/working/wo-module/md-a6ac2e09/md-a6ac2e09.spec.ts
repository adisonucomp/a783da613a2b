import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdA6ac2e09 } from './md-a6ac2e09';

describe('MdA6ac2e09', () => {
  let component: MdA6ac2e09;
  let fixture: ComponentFixture<MdA6ac2e09>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdA6ac2e09],
    }).compileComponents();

    fixture = TestBed.createComponent(MdA6ac2e09);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
