import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WoExternal } from './wo-external';

describe('WoExternal', () => {
  let component: WoExternal;
  let fixture: ComponentFixture<WoExternal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WoExternal],
    }).compileComponents();

    fixture = TestBed.createComponent(WoExternal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
