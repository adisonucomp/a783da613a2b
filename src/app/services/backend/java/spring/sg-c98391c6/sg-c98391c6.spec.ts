import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SgC98391c6 } from './sg-c98391c6';

describe('SgC98391c6', () => {
  let service: SgC98391c6;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SgC98391c6);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
