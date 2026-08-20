import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PtB4c4c7b1 } from './pt-b4c4c7b1';

describe('PtB4c4c7b1', () => {
  let component: PtB4c4c7b1;
  let fixture: ComponentFixture<PtB4c4c7b1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PtB4c4c7b1],
    }).compileComponents();

    fixture = TestBed.createComponent(PtB4c4c7b1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
