import { Component, OnInit } from '@angular/core';
import { ContractService } from 'src/app/services/contract.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public account:string = "Connect";
  private connected:boolean = false;
  constructor(private contractService:ContractService) { 
    let account = this.contractService.getAccount();
    if(account!=null)
    {
      this.setAccountText(account);
      this.connected= true;
    }
  }

  ngOnInit(): void {
  }

  async connect()
  {
    if(this.connected)
    {
      this.disconnect();
    }
    else{
      let account = await this.contractService.getAccounts();
      this.setAccountText(account);
      this.connected = true;
    }

  }

  disconnect()
  {
    this.contractService.disconnect();
    this.connected = false;
    this.account = "Connect";
  }
  private setAccountText(address:string)
  {
    this.account = address.substring(0,6)+'..';
  }


}
