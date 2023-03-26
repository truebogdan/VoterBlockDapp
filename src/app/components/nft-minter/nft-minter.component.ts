import { Component, OnInit } from '@angular/core';
import { ContractService } from 'src/app/services/contract.service';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { MetadataApiService } from 'src/app/services/metadata-api.service';

@Component({
  selector: 'app-nft-minter',
  templateUrl: './nft-minter.component.html',
  styleUrls: ['./nft-minter.component.css']
})
export class NftMinterComponent implements OnInit {

  public nftDataIsLoading = true;
  public nftCardIsLoading = true;
  public faRefresh = faRefresh;
  public disabledMint:boolean = false;
  public totalSupply:string='';
  public maxSupply:string='';
  public nfts:{id:any,uri:any}[] = [];
  public stakedNfts:{id:any,uri:any}[] = [];
  public balance:string = '0';
  constructor( private contract: ContractService, private MetadataService:MetadataApiService) { 
    
  }

  async ngOnInit(): Promise<void> {
    this.refreshNFTData();
    await this.refreshNFTs();
    let balanceInWei = Number( await this.contract.getReward());
    this.MetadataService.getPrice().subscribe(priceResponse=> {
      let price =priceResponse['matic-network'].usd;
      console.log(balanceInWei);
      console.log(price);
      this.balance = (price * balanceInWei).toPrecision(2);
    });
    console.log(!this.nftCardIsLoading);
    console.log(this.nfts);
    console.log(!this.nfts);
  }

  async safeMint()
  {
    this.disabledMint = true;
    await this.contract.safeMint();
    this.refreshNFTData();
    this.refreshNFTs();
    this.disabledMint = false;
  }

   async refreshNFTs(){
    this.nftCardIsLoading = true;
    const address = await this.contract.getAccount();
    if(address)
    {
      this.nfts = await this.contract.getAllNFTs(address);
      this.stakedNfts = await this.contract.getAllStakedNFTs(address);
    }
    this.nftCardIsLoading = false;
  }

  async refreshNFTData()
  {
    this.nftDataIsLoading = true;
    const nftData = await this.contract.fetchNftInfo();
    this.totalSupply = nftData.totalSupply.toString();
    this.maxSupply = nftData.maxSupply.toString();
    this.nftDataIsLoading = false;
  } 

  async onStakeClicked(id:any){
    this.nftCardIsLoading = true;
    await this.contract.stakeNFT(id);
    this.refreshNFTs();
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
