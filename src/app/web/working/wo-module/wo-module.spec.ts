import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WoModule } from './wo-module';

describe('WoModule', () => {
  let component: WoModule;
  let fixture: ComponentFixture<WoModule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WoModule],
    }).compileComponents();

    fixture = TestBed.createComponent(WoModule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
