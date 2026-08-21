import { TestBed } from '@angular/core/testing';
import { WgSidebar } from './wg-sidebar';

describe('WgSidebar', () => {
  let service: WgSidebar;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WgSidebar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
