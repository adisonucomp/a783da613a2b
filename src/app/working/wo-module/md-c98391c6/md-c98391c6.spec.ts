import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdC98391c6 } from './md-c98391c6';

describe('MdC98391c6', () => {
  let component: MdC98391c6;
  let fixture: ComponentFixture<MdC98391c6>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdC98391c6],
    }).compileComponents();

    fixture = TestBed.createComponent(MdC98391c6);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
