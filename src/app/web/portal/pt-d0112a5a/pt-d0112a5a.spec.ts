import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PtD0112a5a } from './pt-d0112a5a';

describe('PtD0112a5a', () => {
  let component: PtD0112a5a;
  let fixture: ComponentFixture<PtD0112a5a>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PtD0112a5a],
    }).compileComponents();

    fixture = TestBed.createComponent(PtD0112a5a);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
