import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SgA6ac2e09 } from './sg-a6ac2e09';

describe('SgA6ac2e09', () => {
  let service: SgA6ac2e09;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SgA6ac2e09);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
