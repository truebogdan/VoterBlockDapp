import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { createModel } from '../models/createModel';
import { metadataModel } from '../models/metadataModel';

@Injectable({
  providedIn: 'root'
})
export class MetadataApiService {

  apiUrl:string = "https://localhost:7088/Poll";
  constructor(private http: HttpClient) { }

  uploadMetadata(model:createModel):Observable<boolean>{
    console.log(model);
    const formData: FormData = new FormData();
    model.optionNames.forEach(option => formData.append('options',option));
    model.images.forEach(image => formData.append('files',image));
    model.labels.forEach(label => formData.append('labels',label));
    formData.append('name',model.name);
    formData.append('index',model.index);

    return this.http.post<any>(this.apiUrl + '/UploadMetadata',formData); 
  }

  getMetadata(index:number):Observable<metadataModel>{
    return this.http.get<metadataModel>(this.apiUrl+'/GetMetadata/'+index);
  }
}
