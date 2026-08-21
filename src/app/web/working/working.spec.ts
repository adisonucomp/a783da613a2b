import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Working } from './working';

describe('Working', () => {
  let component: Working;
  let fixture: ComponentFixture<Working>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Working],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Working);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
