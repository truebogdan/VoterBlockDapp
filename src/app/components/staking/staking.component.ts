import { Component, OnInit } from '@angular/core';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { ContractService } from 'src/app/services/contract.service';
import { MetadataApiService } from 'src/app/services/metadata-api.service';
@Component({
  selector: 'app-staking',
  templateUrl: './staking.component.html',
  styleUrls: ['./staking.component.css']
})
export class StakingComponent implements OnInit {

  public stakedNfts:{id:any,uri:any}[] = [];
  public faRefresh = faRefresh;
  public balance:string = '0';
  constructor( private contract: ContractService, private MetadataService:MetadataApiService) { }

  async ngOnInit(): Promise<void> {
    await this.refreshNFTs();
    let balanceInWei = Number( await this.contract.getReward());
    this.MetadataService.getPrice().subscribe(priceResponse=> {
      let price =priceResponse['matic-network'].usd;
      console.log(balanceInWei);
      console.log(price);
      this.balance = (price * balanceInWei).toPrecision(2);
    });
  }

  public nftCardIsLoading = true;
  async refreshNFTs(){
    this.nftCardIsLoading = true;
    const address = await this.contract.getAccount();
    if(address)
    {
      this.stakedNfts = await this.contract.getAllStakedNFTs(address);
    }
    this.nftCardIsLoading = false;
  }

  async onUnstakeClicked(id:any){
    this.nftCardIsLoading = true;
    await this.contract.unstakeNFT(id);
    this.refreshNFTs(); 
   }

   async claimReward(){
    await this.contract.claimReward();
    this.balance = '0';
  } 

}
