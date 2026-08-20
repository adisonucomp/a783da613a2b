import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MdB8043c54 } from './md-b8043c54';

describe('MdB8043c54', () => {
  let component: MdB8043c54;
  let fixture: ComponentFixture<MdB8043c54>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdB8043c54],
    }).compileComponents();

    fixture = TestBed.createComponent(MdB8043c54);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
