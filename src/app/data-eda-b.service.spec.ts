import { TestBed } from '@angular/core/testing';

import { DataEdaBService } from './data-eda-b.service';

describe('DataEdaBService', () => {
  let service: DataEdaBService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataEdaBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
