
import { Injectable, NgZone } from '@angular/core';
import { ethers } from 'ethers';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import SmartContract from '../../assets/SmartContractABI';

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
    const voterBlockContract = new ethers.Contract(SmartContract.Adress, SmartContract.ABI, this.provider);
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
      const voterBlockContract = new ethers.Contract(SmartContract.Adress,SmartContract.ABI,this.provider.getSigner());
      console.log(this.provider.getSigner());
      let poll = await voterBlockContract['createPoll'](name,optionNames,deadline ,voters);
      voterBlockContract.on("PollCreated", pollIndex => {
        this.PollCreated.next(pollIndex);
      });
      return this.PollCreated.asObservable();
  }

  public async vote(option:string ,pollIndex:number)
  {
    const voterBlockContract = new ethers.Contract(SmartContract.Adress,SmartContract.ABI,this.provider.getSigner());
    let voted = await voterBlockContract['voteForOption'](pollIndex,option);
    voterBlockContract.on('OptionVoted', totalVotes => {
      this.OptionVoted.next(totalVotes);
    });
    return this.OptionVoted.asObservable();
  }

  public async canVote(index:number , address:string)
  {
    const voterBlockContract = new ethers.Contract(SmartContract.Adress,SmartContract.ABI,this.provider.getSigner());
    return await voterBlockContract['canVote'](index,address);
  }
}