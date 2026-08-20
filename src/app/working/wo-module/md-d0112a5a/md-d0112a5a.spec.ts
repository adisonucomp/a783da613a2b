import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdD0112a5a } from './md-d0112a5a';

describe('MdD0112a5a', () => {
  let component: MdD0112a5a;
  let fixture: ComponentFixture<MdD0112a5a>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdD0112a5a],
    }).compileComponents();

    fixture = TestBed.createComponent(MdD0112a5a);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
