import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExLogin } from './ex-login';

describe('ExLogin', () => {
  let component: ExLogin;
  let fixture: ComponentFixture<ExLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExLogin],
    }).compileComponents();

    fixture = TestBed.createComponent(ExLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
