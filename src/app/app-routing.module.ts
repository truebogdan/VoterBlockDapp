import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PollCreatorComponent } from './components/poll-creator/poll-creator.component';
import { PollViewerComponent } from './components/poll-viewer/poll-viewer.component';

const routes: Routes = [
  {path:'' , component:PollViewerComponent},
  {path:'create',component:PollCreatorComponent},
  {path:'poll/:id',component:PollViewerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
