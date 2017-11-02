import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { Router } from '@angular/router';
import { TransomSyncService } from './transom-sync.service';
import { TransomApiAuthService } from './transom-api-auth.service';

describe('SyncService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [TransomSyncService,
        TransomApiAuthService,
        {
          provide: Router, useClass: class { public navigate = jasmine.createSpy('navigate'); }
        }
      ]
    });
  });

  it('should be created', inject([TransomSyncService], (service: TransomSyncService) => {
    expect(service).toBeTruthy();
  }));
});
