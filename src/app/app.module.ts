import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PollViewerComponent } from './components/poll-viewer/poll-viewer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PollCreatorComponent } from './components/poll-creator/poll-creator.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';
import { RxReactiveFormsModule } from "@rxweb/reactive-form-validators";
import { NgChartsModule } from 'ng2-charts';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import { DxDataGridModule } from 'devextreme-angular';
import { CdTimerModule } from 'angular-cd-timer';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NftMinterComponent } from './components/nft-minter/nft-minter.component';
import { AccountBalanceComponent } from './components/account-balance/account-balance.component';
import { GovernanceComponent } from './components/governance/governance.component';
import { VerticalNavbarComponent } from './components/vertical-navbar/vertical-navbar.component';
import { StakingComponent } from './components/staking/staking.component';


@NgModule({
  declarations: [
    AppComponent,
    PollViewerComponent,
    NavbarComponent,
    PollCreatorComponent,
    NftMinterComponent,
    AccountBalanceComponent,
    GovernanceComponent,
    VerticalNavbarComponent,
    StakingComponent
  ],
  imports: [
    MatExpansionModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    RxReactiveFormsModule,
    NgChartsModule ,
    CdTimerModule,
    FontAwesomeModule,
    DxDataGridModule
  ],
    
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
