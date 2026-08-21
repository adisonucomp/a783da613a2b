import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SgAuth } from './sg-auth';

describe('SgAuth', () => {
  let service: SgAuth;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SgAuth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
