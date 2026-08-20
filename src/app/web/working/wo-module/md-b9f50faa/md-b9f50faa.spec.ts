import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdB9f50faa } from './md-b9f50faa';

describe('MdB9f50faa', () => {
  let component: MdB9f50faa;
  let fixture: ComponentFixture<MdB9f50faa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdB9f50faa],
    }).compileComponents();

    fixture = TestBed.createComponent(MdB9f50faa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
