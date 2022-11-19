import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit, ViewChild, ViewChildren , AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { pollModel } from 'src/app/models/pollModel';
import { ContractService } from 'src/app/services/contract.service';
import { MetadataApiService } from 'src/app/services/metadata-api.service';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {CdTimerComponent, TimeInterface} from 'angular-cd-timer';
import { faLock } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-poll-viewer',
  templateUrl: './poll-viewer.component.html',
  styleUrls: ['./poll-viewer.component.css']
})
export class PollViewerComponent implements OnInit {

  faCoffee = faLock;
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        formatter: (value, ctx) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
        },
      },
    }
  };
  public hasExpired = false;
  public isClosed = false;
  public pieChartData: ChartData<'pie', number[], string | string[]> | undefined;
  public pieChartType: ChartType = 'pie';
  public deadlineInSeconds :number = 0;
  model:pollModel = new pollModel();
  status:string= 'LOADING';
  private id:number=0;
  private subscribes:Subscription[];
  constructor( private route: ActivatedRoute , private contract: ContractService,private metadadataService:MetadataApiService) { 
    this.subscribes =[];
  }


  ngOnInit(): void {
    this.subscribes.push(this.route.params.subscribe(params => {
      this.id = + params['id'];
      this.contract.getPoll(this.id).then(res => {
        this.model.name = res.pollName;
        this.model.deadline = res.deadline.toString();
        this.deadlineInSeconds = (this.model.deadline - (new Date()).getTime())/1000;
        if(this.deadlineInSeconds <= 0){
          this.hasExpired = true;
          this.isClosed = true;
          this.deadlineInSeconds = 0;
        } 
        this.model.optionNames = res.optionsNames;
        this.model.index = this.id.toString();
        for(let i=0;i<res.optionsVotes.length ; i++)
        {
          this.model.votes.push(res.optionsVotes[i].toString())
        }
        this.metadadataService.getMetadata(this.id).subscribe(res =>{
          this.model.labels = res.metadata?.labels;
          this.model.images = JSON.parse(res.imagePath);
          this.updateChart();
          this.status='READY';
          let address = this.contract.getAccount();
          this.isClosed = true;
          if(address && !this.hasExpired)
          {
            this.contract.canVote(this.id,address).then(res => {
              this.isClosed = !res ;
            });
          }
        });
      });

    }));

  }

  public async sendVote(index:number)
  {
    let option = this.model.optionNames[index];
    let pollIndex = Number(this.model.index);
    this.status='LOCK';
    let optionVotes = await this.contract.vote(option, pollIndex);
    optionVotes.subscribe( res => {
      this.status='READY';
      this.model.votes[index ] = res.toString(); 
      this.updateChart();
      this.isClosed = true;
    });
  }

  private updateChart()
  {
    this.pieChartData = {
      labels: this.model.optionNames,
      datasets: [ {
        data: this.model.votes.map(function(item) {
          return parseInt(item);
      })
      } ]
    };
  }
  
  public closePoll()
  {
    this.hasExpired = true;
    this.isClosed = true;
  }

}
