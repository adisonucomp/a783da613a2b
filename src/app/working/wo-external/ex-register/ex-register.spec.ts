import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExRegister } from './ex-register';

describe('ExRegister', () => {
  let component: ExRegister;
  let fixture: ComponentFixture<ExRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(ExRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
