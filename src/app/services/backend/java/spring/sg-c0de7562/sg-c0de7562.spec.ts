import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SgC0de7562 } from './sg-c0de7562';

describe('SgC0de7562', () => {
  let service: SgC0de7562;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SgC0de7562);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
