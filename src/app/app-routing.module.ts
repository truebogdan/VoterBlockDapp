import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GovernanceComponent } from './components/governance/governance.component';
import { NftMinterComponent } from './components/nft-minter/nft-minter.component';
import { PollCreatorComponent } from './components/poll-creator/poll-creator.component';
import { PollViewerComponent } from './components/poll-viewer/poll-viewer.component';
import { StakingComponent } from './components/staking/staking.component';

const routes: Routes = [
  {path:'nft' , component:NftMinterComponent},
  {path:'create',component:PollCreatorComponent},
  {path:'poll/:id',component:PollViewerComponent},
  {path:'staking',component:StakingComponent},
  {path:'gov', component:GovernanceComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
