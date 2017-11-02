import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { TransomApiAuthService } from './transom-api-auth.service';
import { TransomDataService } from './transom-data.service';
import { TransomSyncService } from './transom-sync.service';


@NgModule({
  imports: [
    CommonModule, HttpModule
  ],
  providers: [
    TransomApiAuthService, TransomDataService, TransomSyncService
  ],
  declarations: []
})
export class TransomApiclientModule { }
