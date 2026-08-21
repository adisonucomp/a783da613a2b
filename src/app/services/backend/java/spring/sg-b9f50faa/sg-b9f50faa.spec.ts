import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SgB9f50faa } from './sg-b9f50faa';

describe('SgB9f50faa', () => {
  let service: SgB9f50faa;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SgB9f50faa);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
