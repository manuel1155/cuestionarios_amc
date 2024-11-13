import { TestBed } from '@angular/core/testing';

import { ExcelTelemedicinaService } from './excel-telemedicina.service';

describe('ExcelTelemedicinaService', () => {
  let service: ExcelTelemedicinaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelTelemedicinaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
