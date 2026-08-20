import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdB2412519 } from './md-b2412519';

describe('MdB2412519', () => {
  let component: MdB2412519;
  let fixture: ComponentFixture<MdB2412519>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdB2412519],
    }).compileComponents();

    fixture = TestBed.createComponent(MdB2412519);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
