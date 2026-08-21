import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CeLogin } from './ce-login';

describe('CeLogin', () => {
  let component: CeLogin;
  let fixture: ComponentFixture<CeLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CeLogin],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CeLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
