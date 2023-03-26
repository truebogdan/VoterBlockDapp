import { Component, OnInit } from '@angular/core';
import { poll } from 'ethers/lib/utils';
import { AppComponent } from 'src/app/app.component';
import { ContractService } from 'src/app/services/contract.service';
import { MetadataApiService } from 'src/app/services/metadata-api.service';

@Component({
  selector: 'app-governance',
  templateUrl: './governance.component.html',
  styleUrls: ['./governance.component.css']
})
export class GovernanceComponent implements OnInit {
  static contractstatic: any;
  static metadatastsatic:any;
  
  constructor(private contract: ContractService, private metadata: MetadataApiService) { 
    GovernanceComponent.contractstatic = contract;
    GovernanceComponent.metadatastsatic = metadata;
  }
  votingPower:string = " ";
  govtitle: string;
  govcost:number;
  govprnumber:number;
  public proposalType = 1;
  async ngOnInit(): Promise<void> {
    let power = await this.contract.getVotingPower();
    this.votingPower = power;
    this.fetchAllPolls();
  }
  openPolls :any[]= [];
  async onSavePoll(){
    await this.contract.createGovPoll(this.govtitle,this.govcost, this.proposalType);
  }

  async fetchAllPolls(){
    this.openPolls = await this.contract.getAllPolls();
  }

  isActionButtonDisabled(e:any) {
    console.log("actions visible", e.row.data.CanVote);
    return !e.row.data.CanVote;
  }
  async actionYesClick(e:any) {
    let pollId = e.row.data.ID;
    await GovernanceComponent.getContractInstance().VoteYesForGovPoll(pollId);
  }

  async actionNoClick(e:any) {
    let pollId = e.row.data.ID;
    await GovernanceComponent.getContractInstance().VoteNoForGovPoll(pollId);
  }

  async actionCompleteClick(e:any) {
    let pollId = e.row.data.ID;
    let onProposalCreated =await GovernanceComponent.getContractInstance().VoteCompleteForGovPoll(pollId);
    onProposalCreated.subscribe((model: {
      effect(effect: any): unknown; _type: number; 
}) =>
    {
      if(model._type == 2)
      {
        GovernanceComponent.getMetadataServiceInstance().completePR(model.effect);
      }
    }
    );
  }
  
 private static getContractInstance(){
    return GovernanceComponent.contractstatic;
  }

 private static getMetadataServiceInstance(){
  return GovernanceComponent.metadatastsatic;
 } 

 public onChange(target:any){
  this.proposalType = target.value;
} 

}
