import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SgB8043c54 } from './sg-b8043c54';

describe('SgB8043c54', () => {
  let service: SgB8043c54;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SgB8043c54);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
