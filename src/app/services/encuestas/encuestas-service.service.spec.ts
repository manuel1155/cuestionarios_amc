import { TestBed } from '@angular/core/testing';

import { EncuestasServiceService } from './encuestas-service.service';

describe('EncuestasServiceService', () => {
  let service: EncuestasServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncuestasServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
