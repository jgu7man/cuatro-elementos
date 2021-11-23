import { TestBed } from '@angular/core/testing';

import { CurrentTableService } from './current-table.service';

describe('CurrentTableService', () => {
  let service: CurrentTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
