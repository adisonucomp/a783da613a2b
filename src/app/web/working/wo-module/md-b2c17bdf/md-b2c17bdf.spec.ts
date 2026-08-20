import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdB2c17bdf } from './md-b2c17bdf';

describe('MdB2c17bdf', () => {
  let component: MdB2c17bdf;
  let fixture: ComponentFixture<MdB2c17bdf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdB2c17bdf],
    }).compileComponents();

    fixture = TestBed.createComponent(MdB2c17bdf);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
