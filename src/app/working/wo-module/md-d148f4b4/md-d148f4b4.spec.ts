import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdD148f4b4 } from './md-d148f4b4';

describe('MdD148f4b4', () => {
  let component: MdD148f4b4;
  let fixture: ComponentFixture<MdD148f4b4>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdD148f4b4],
    }).compileComponents();

    fixture = TestBed.createComponent(MdD148f4b4);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
