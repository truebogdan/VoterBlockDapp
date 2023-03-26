import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-account-balance',
  templateUrl: './account-balance.component.html',
  styleUrls: ['./account-balance.component.css']
})
export class AccountBalanceComponent implements OnInit {

  constructor() { }
  @Output() public onClaim = new EventEmitter();
  @Input() public balance:string = '0';

  ngOnInit(): void {
  }


}
