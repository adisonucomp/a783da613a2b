import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdB22b6431 } from './md-b22b6431';

describe('MdB22b6431', () => {
  let component: MdB22b6431;
  let fixture: ComponentFixture<MdB22b6431>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdB22b6431],
    }).compileComponents();

    fixture = TestBed.createComponent(MdB22b6431);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
