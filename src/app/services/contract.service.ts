
import { Injectable, NgZone } from '@angular/core';
import { ethers } from 'ethers';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import SmartContractABI from '../../assets/SmartContractABI';
import SmartContract from '../../assets/SmartContractABI';
import { completeProposalModel } from '../models/completeProposalModel';

function _window(): any {
  // return the global native browser window object
  return window;
}


@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private PollCreated : Subject<number> = new Subject();
  private OptionVoted : Subject<number> = new Subject();
  private ProposalCompleted: Subject<completeProposalModel> = new Subject();
  private accountSubject: BehaviorSubject<string>;
  public account: Observable<string>;
  public networkChanged = new Subject<string>();
  public provider: ethers.providers.Web3Provider =  new ethers.providers.Web3Provider(this.nativeWindow.ethereum);

  constructor(private ngZone: NgZone) {
    if (localStorage["account"]) {
      this.accountSubject = new BehaviorSubject<string>(localStorage["account"]);
    } else {
      this.accountSubject = new BehaviorSubject<string>("");
    }
    this.account = this.accountSubject.asObservable();

    //wire up provider and ethereum event callbacks
    if (this.nativeWindow.ethereum) {
      this.provider = new ethers.providers.Web3Provider(this.nativeWindow.ethereum);
      this.nativeWindow.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.ngZone.run(() => {
          if (accounts.length > 0) {
            this.accountSubject.next(accounts[0]);
            localStorage.setItem("account", accounts[0]);
          } else {
            this.accountSubject.next("");
            localStorage.removeItem("account");
          }
        });

      });

      this.nativeWindow.ethereum.on('chainChanged', (chainId: string) => {
        this.ngZone.run(() => {
          this.networkChanged.next(this.getNetworkName(chainId));
        });

      });


    }
  }
  public get hasWeb3(): boolean {
    if (this.nativeWindow.ethereum) {
      return true;
    } else {
      return false;
    }
  }
  public disconnect() {
    this.accountSubject.next("");
    localStorage.removeItem("account");

  }
  public async getBalance(tokenAddress: string): Promise<Number> {
    const tokenContract = new ethers.Contract(tokenAddress, "ABI", this.provider);
    return await tokenContract['balanceOf'](this.accountSubject.value);
  }

  public async getAccounts() {
    const accounts = await this.nativeWindow.ethereum.request({ method: 'eth_requestAccounts' });
    this.accountSubject.next(accounts[0]);
    localStorage.setItem("account", accounts[0]);
    return accounts[0];
  }

  public async getPoll(number:number){
    const voterBlockContract = new ethers.Contract(SmartContract.VBAddress, SmartContract.VBABI, this.provider);
    let poll = await voterBlockContract['getPoll'](number);
    return poll;
  }

  get nativeWindow(): any {
    return _window();
  }
  public getNetwork() {
    if (this.hasWeb3) {
      this.networkChanged.next(this.getNetworkName(this.nativeWindow.ethereum.chainId));
    }
  }
  private getNetworkName(id: string): string {
    switch (id) {
      case "0x1":
        return "";
      case "0x2a":
        return "Kovan Network";
      case "0x64":
        return "xDai"
      default:
        return "Unknown Network";
    }
  }

  public getAccount(){
    return localStorage.getItem('account'); 
  }

  public async createPoll(name:string,optionNames:string[], deadline:number , voters:string[])
  {
      const voterBlockContract = new ethers.Contract(SmartContract.VBAddress,SmartContract.VBABI,this.provider.getSigner());
      const pollCreationCost = await voterBlockContract['pollCreationCost']();
      console.log(pollCreationCost);
      const options = {value: pollCreationCost}


      console.log(name);
      console.log(optionNames);
      console.log(voters);
      console.log(options);
      let poll = await voterBlockContract['createPoll'](name,optionNames,deadline ,voters, options);
      voterBlockContract.on("PollCreated", pollIndex => {
        this.PollCreated.next(pollIndex);
      });
      return this.PollCreated.asObservable();
  }

  public async vote(option:string ,pollIndex:number)
  {
    const voterBlockContract = new ethers.Contract(SmartContract.VBAddress,SmartContract.VBABI,this.provider.getSigner());
    let voted = await voterBlockContract['voteForOption'](pollIndex,option);
    voterBlockContract.on('OptionVoted', totalVotes => {
      this.OptionVoted.next(totalVotes);
    });
    return this.OptionVoted.asObservable();
  }

  public async canVote(index:number , address:string)
  {
    const voterBlockContract = new ethers.Contract(SmartContract.VBAddress,SmartContract.VBABI,this.provider.getSigner());
    return await voterBlockContract['canVote'](index,address);
  }

  public async fetchNftInfo()
  {
    const nftContract = new ethers.Contract(SmartContract.NFTAddress,SmartContract.nftABI, this.provider);
    const MAX_SUPPLY =  await nftContract['MAX_SUPPLY']();
    const totalSupply = await nftContract['totalSupply']();

    return {totalSupply:totalSupply, maxSupply:MAX_SUPPLY};
  }

  public async getAllNFTs(address:string)
  {
    const nftContract = new ethers.Contract(SmartContract.NFTAddress,SmartContract.nftABI, this.provider);
    const balance = await nftContract['balanceOf'](address);
    let nfts = [];
    for(let i =0 ;i<balance;i++)
    {
      let id = await nftContract['tokenOfOwnerByIndex'](address,i);
      let imageUrl = await nftContract['tokenURI'](id);
       nfts.push({id:id,uri:imageUrl});
    }
    return nfts;
  }

  public async getAllStakedNFTs(address:string){
    const stakingContract = new ethers.Contract(SmartContract.StakingAddress, SmartContractABI.stakingABI, this.provider.getSigner());
    const nftContract = new ethers.Contract(SmartContract.NFTAddress,SmartContract.nftABI, this.provider);
    const stakes = await stakingContract['getStakes'](address);
    console.log(stakes);
    let stakedNfts = [];
    for(let i= 0; i<stakes.length ; i++)
    {
      if(stakes[i].isWithdrawn === false){
        let imageUrl = await nftContract['tokenURI'](stakes[i][0]);
        stakedNfts.push({id:stakes[i][0] ,uri:imageUrl})
      }

    }
    return stakedNfts;
  }
  public async safeMint()
  {
    const nftContract = new ethers.Contract(SmartContract.NFTAddress,SmartContract.nftABI, this.provider.getSigner());
    var tx = await nftContract['safeMint']();
    var reciept = await tx.wait();
    console.log(reciept);
  }

  public async stakeNFT(id:any)
  {
    let isTokenApprovedForTransfer = await this.CheckApprovedForToken(id);
    if(!isTokenApprovedForTransfer)
    {
    const nftContract = new ethers.Contract(SmartContract.NFTAddress,SmartContract.nftABI, this.provider.getSigner());
    var tx = await nftContract['approve'](SmartContract.StakingAddress,id);
    var reciept = await tx.wait();
    console.log("Approved");
    } 

    const stakingContract = new ethers.Contract(SmartContract.StakingAddress, SmartContractABI.stakingABI, this.provider.getSigner());
    tx = await stakingContract['stake'](id);
    reciept = await tx.wait();
    console.log("Staked");
  }

  public async unstakeNFT(id:any)
  {
    const stakingContract = new ethers.Contract(SmartContract.StakingAddress, SmartContractABI.stakingABI, this.provider.getSigner());
    let tx = await stakingContract['unstake'](id);
    await tx.wait();
    console.log("Staked");
  }

  public async CheckApprovedForToken(id:number) :Promise<boolean>
  {
    const nftContract = new ethers.Contract(SmartContract.NFTAddress,SmartContract.nftABI, this.provider);
    const approved= await nftContract['getApproved'](id);
    return approved === SmartContract.StakingAddress
  }

  public async getReward() : Promise<string>
  {
    const voterBlockContract = new ethers.Contract(SmartContract.VBAddress,SmartContract.VBABI,this.provider.getSigner());
    let reward = await voterBlockContract['rewardsMap'](this.getAccount());
    console.log("address",this.getAccount());
    console.log("reward",reward)
    return ethers.utils.formatEther(reward);
  }
  
  public async claimReward(){
    const voterBlockContract = new ethers.Contract(SmartContract.VBAddress,SmartContract.VBABI,this.provider.getSigner());
    let tx = await voterBlockContract['claimReward']();
    await tx.wait();
    console.log("Reward claimed");
  }

  public async getVotingPower(){
    const governanceContract = new ethers.Contract(SmartContract.GovAddress, SmartContract.GovABI , this.provider);
    return await governanceContract['getPowerForAddress'](this.getAccount());
  }

  public async createGovPoll(title:string, cost:number,type:number){
    const governanceContract = new ethers.Contract(SmartContract.GovAddress, SmartContract.GovABI , this.provider.getSigner());
    //let costInWei = cost * 1000000000000000000;
    //console.log(costInWei);
  
    console.log(title,cost,type);
    if(type == 1)
    {
      await governanceContract['createPoll'](title,ethers.utils.parseEther(cost.toString()), type);
    }
    if(type ==2 )
    {
      await governanceContract['createPoll'](title,cost, type);  
    }
  }

  public async getAllPolls(): Promise<any[]>{
    const governanceContract = new ethers.Contract(SmartContract.GovAddress, SmartContract.GovABI , this.provider);
    let length = await governanceContract['getPollsNumber']();
    let polls = [];
    for(let i=0; i< length; i ++)
    {
      let poll = await governanceContract['polls'](i);
      let pollData = await governanceContract['getPollData'](i);
      console.log(poll);
      console.log(pollData[2].filter((x: any)=> (x == true)).length/ pollData[2].length /100);
      console.log(poll.deadline   - Date.now()/1000);
      let processData = this.processData({...poll,...pollData},i);
      console.log((processData.Target.indexOf(this.getAccount()?.toUpperCase())>=0));
      if(processData.Target.indexOf(this.getAccount()?.toUpperCase())>=0){
        processData.CanVote = true;
      };
      polls.push(processData);
    }
    console.log(polls);
   return polls;
  }

  private processData(data:any, id:any){
    console.log("data",data);
    console.log(data[2].filter((x:any)=> x == true).length/data[2].length * 100);
        return {
        ID: id, 
        Title:data.title,
        Effect:ethers.utils.formatEther(data.effect),
        CreatedBy:data.author,
        Turnout:data[2].filter((x: any)=> (x == true)).length/ data[2].length  *100 + '%' ,
        ClosesIn:this.secondsToHm(data.deadline   - Date.now()/1000),
        Target:data[0].map((a: any) => a.toUpperCase()),
        CanVote:false,
        SuccessRate: this.CalculateSuccessRate(data.yes, data.no),
        Status: this.CalculateStatus(data.deadline - Date.now()/1000,data.completed)
      };
    }
 private CalculateStatus(remainingMs:any, isCompleted:any)
 {
    if(isCompleted == true)
    {
      return "COMPLETED";
    }

    if(remainingMs<0)
    {
      return "CLOSED";
    }

    return "LIVE";
 }   
 private secondsToHm(seconds:any) {
      seconds = Number(seconds);
      var h = Math.floor(seconds / 3600);
      var m = Math.floor(seconds % 3600 / 60);
  
      var hDisplay = h > 0 ? h + "h " : "";
      var mDisplay = m > 0 ? m + "m" : "";
      return hDisplay + mDisplay;
  }
  
   private CalculateSuccessRate(y:any,n:any){
    let total = +y+ +n ;
    if(total == 0)
    {
      return ""+50;
    }

    else{
      return ""+(y / total * 100);
    }


  }

  public async VoteYesForGovPoll(pollId:any){
    const governanceContract = new ethers.Contract(SmartContract.GovAddress, SmartContract.GovABI , this.provider.getSigner());
    await governanceContract["voteYes"](pollId);
  }

  public async VoteNoForGovPoll(pollId:any){
    const governanceContract = new ethers.Contract(SmartContract.GovAddress, SmartContract.GovABI , this.provider.getSigner());
    await governanceContract["voteNo"](pollId);
  }

  public async VoteCompleteForGovPoll(pollId:any){
    const governanceContract = new ethers.Contract(SmartContract.GovAddress, SmartContract.GovABI , this.provider.getSigner());
    await governanceContract["completePoll"](pollId);
    governanceContract.on("ProposalCompleted", (_type,effect) => {
      this.ProposalCompleted.next({_type:_type,effect:effect});
    });

    return this.ProposalCompleted.asObservable();
  }
}