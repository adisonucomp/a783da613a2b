import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdC0de7562 } from './md-c0de7562';

describe('MdC0de7562', () => {
  let component: MdC0de7562;
  let fixture: ComponentFixture<MdC0de7562>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdC0de7562],
    }).compileComponents();

    fixture = TestBed.createComponent(MdC0de7562);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
