import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PtC98391c6 } from './pt-c98391c6';

describe('PtC98391c6', () => {
  let component: PtC98391c6;
  let fixture: ComponentFixture<PtC98391c6>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PtC98391c6],
    }).compileComponents();

    fixture = TestBed.createComponent(PtC98391c6);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
