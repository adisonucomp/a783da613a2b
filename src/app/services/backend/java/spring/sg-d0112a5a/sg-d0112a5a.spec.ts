import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SgD0112a5a } from './sg-d0112a5a';

describe('SgD0112a5a', () => {
  let service: SgD0112a5a;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SgD0112a5a);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
