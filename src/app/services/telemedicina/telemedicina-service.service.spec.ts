import { TestBed } from '@angular/core/testing';

import { TelemedicinaServiceService } from './telemedicina-service.service';

describe('TelemedicinaServiceService', () => {
  let service: TelemedicinaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TelemedicinaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
