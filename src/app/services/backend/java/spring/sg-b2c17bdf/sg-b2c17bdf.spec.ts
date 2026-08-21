import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SgB2c17bdf } from './sg-b2c17bdf';

describe('SgB2c17bdf', () => {
  let service: SgB2c17bdf;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SgB2c17bdf);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
