import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { vetGuard } from './vet-guard';

describe('vetGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => vetGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
