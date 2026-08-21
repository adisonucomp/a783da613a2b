import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SgB2412519 } from './sg-b2412519';

describe('SgB2412519', () => {
  let service: SgB2412519;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SgB2412519);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
