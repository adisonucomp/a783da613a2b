import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PtHome } from './pt-home';

describe('PtHome', () => {
  let component: PtHome;
  let fixture: ComponentFixture<PtHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PtHome],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PtHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
