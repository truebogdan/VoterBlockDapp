import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PollViewerComponent } from './components/poll-viewer/poll-viewer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PollCreatorComponent } from './components/poll-creator/poll-creator.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';
import { RxReactiveFormsModule } from "@rxweb/reactive-form-validators";
import { NgChartsModule } from 'ng2-charts';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import { CdTimerModule } from 'angular-cd-timer';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [
    AppComponent,
    PollViewerComponent,
    NavbarComponent,
    PollCreatorComponent
  ],
  imports: [
    MatExpansionModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    RxReactiveFormsModule,
    NgChartsModule ,
    CdTimerModule,
    FontAwesomeModule
  ],
    
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
