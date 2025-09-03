import { TestBed } from '@angular/core/testing';

import { Vet } from './vet';

describe('Vet', () => {
  let service: Vet;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vet);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
