import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SgB22b6431 } from './sg-b22b6431';

describe('SgB22b6431', () => {
  let service: SgB22b6431;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SgB22b6431);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
