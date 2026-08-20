import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdB4c4c7b1 } from './md-b4c4c7b1';

describe('MdB4c4c7b1', () => {
  let component: MdB4c4c7b1;
  let fixture: ComponentFixture<MdB4c4c7b1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdB4c4c7b1],
    }).compileComponents();

    fixture = TestBed.createComponent(MdB4c4c7b1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
