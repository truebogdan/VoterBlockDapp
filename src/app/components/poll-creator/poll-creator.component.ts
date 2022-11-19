import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { createModel } from 'src/app/models/createModel';
import { ContractService } from 'src/app/services/contract.service';
import { MetadataApiService } from 'src/app/services/metadata-api.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-poll-creator',
  templateUrl: './poll-creator.component.html',
  styleUrls: ['./poll-creator.component.css']
})
export class PollCreatorComponent implements OnInit {
  minDate= new Date().toISOString().split(".")[0];
  status:string ='NOT_STARTED';
  textStatus:string='';
  model:createModel = new createModel();
  pollForm = new FormGroup({
    name:new FormControl(''),
    numberOfOptions:new FormControl(2),
    deadline:new FormControl(''),
    voters:new FormControl()
  });
  optionForms:FormGroup[]=[];
 // private pollModel:Poll;
  constructor(private contractService:ContractService, private metadadataService:MetadataApiService) { 
   }

  ngOnInit(): void {
    this.reloadOptions();
  }
  
  next(): void {
  
  }

  async create() {
    this.textStatus="Please sign the transaction";
    this.status="LOADING";
    if(this.pollForm.value.name && this.pollForm.value.deadline)
    {
      this.model.name = this.pollForm.value.name;
      let deadlineString = this.pollForm.value.deadline?.toString(); 
      let timestamp = (new Date(deadlineString)).getTime();
      this.model.deadline = timestamp;
      console.log(this.model.voters);
      this.optionForms.forEach( form => {

        this.model.optionNames.push(form.value.name);
        this.model.labels.push(form.value.label);
        this.model.images.push(form.value.image[0]);
      });
      this.textStatus="Processing transaction";
      let onPollCreated =  await this.contractService.createPoll(this.model.name, this.model.optionNames, this.model.deadline , this.model.voters);
      onPollCreated.subscribe( pollIndex => {
      this.model.index = pollIndex.toString();
      this.textStatus="Processing metadata";
      this.metadadataService.uploadMetadata(this.model).subscribe(response => {
        this.status="DONE";
      });
     });
     }
  }
  onNumberOfOptionsChanged() {
    this.reloadOptions();
  }

  private reloadOptions() {

    if(this.pollForm.value.numberOfOptions){
      this.optionForms = [];
      for(let i = 0 ; i < this.pollForm.value.numberOfOptions ; i ++)
      {
        this.optionForms.push( new FormGroup({
          name: new FormControl(''),
          label: new FormControl(),
          image: new FormControl(),
        }));
      }
    }

  }

  onFileChange(target:any) {
    const files = target.files;
    if(files && files.length > 0 && files.item(0 ) != null) {
       let file : File |null = files.item(0);
       if(file !=null)
       {
        let reader: FileReader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
           let csv: string = reader.result as string;
          this.model.voters.push(...csv.split("\r\n"));
        }
       }
      }
  }
}
