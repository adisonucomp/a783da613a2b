import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PtRegister } from './pt-register';

describe('PtRegister', () => {
  let component: PtRegister;
  let fixture: ComponentFixture<PtRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PtRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(PtRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
