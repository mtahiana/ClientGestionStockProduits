import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';

import { DataModel } from '../../data.model';
import { CrudService } from '../../crud.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  @ViewChild("fileUploadInput", {static: true})
  fileUploadInput: any;

  @Input()
  dataModelList: DataModel[];

  @Input()
  service: CrudService;

  @Output()
  updateData: EventEmitter<any> = new EventEmitter<any>();

  dataArray: any = null;

  dataModelListFiltred: any;

  currentStep = 1;

  selectedStep = 1;

  dataFromServer: any = null;

  dataSentToServer: boolean = false;

  fileName: string = '';

  //logObject: any;

  constructor() { }

  ngOnInit() {
    this.dataModelListFiltred = this.dataModelList.filter(dataModel => !dataModel.readonly);
  }

  getBindHeadersDataModelListArray(headers){
    let bindArray = [];
    let index = 0;

    let getDataType = (header) => {
      let dataType = '';
      this.dataModelList.forEach(dataModel => {
        if(dataModel.columnName == header){
          dataType = dataModel.dataType;
        }
      });
      return dataType;
    };

    headers.forEach(header => {
      const bindItem = {
        columnName: header,
        dataType: getDataType(header),
        index: index
      };
      index++;
      bindArray.push(bindItem);
    });

    return bindArray;
  }

  buildDataArray(bindArray, csvRecordsArray){
    let dataArray = [];
    if(csvRecordsArray && csvRecordsArray.length>2){
      for(let i = 1; i<csvRecordsArray.length; i++){
        const dataCsv = csvRecordsArray[i].split(";");
        const dataCrud = {};
        bindArray.forEach(bindItem => {
          dataCrud[bindItem.columnName] = bindItem.dataType == 'number' ? Number(dataCsv[bindItem.index]) : dataCsv[bindItem.index];
        });

        dataArray.push(dataCrud);
      }

    }
    return dataArray;
  }

  selectFile($event){
    //console.log($event.srcElement.files);
    let fileList = $event.srcElement.files;
    let file = fileList[0];
    if(file && file.name.endsWith(".csv")){
      //console.log("yes");
      //console.log(file);
      this.fileName = file.name;
      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = (data) => {
        //console.log(data);
        let csvData = reader.result;
        //console.log(csvData);
        let csvRecordsArray = csvData.split(/\r\n|\n/);
        //console.log(csvRecordsArray);
        let headers = csvRecordsArray && csvRecordsArray.length>0 ? csvRecordsArray[0].split(";") : [];
        //console.log(headers);
        // bind headers with dataModelist
        let bindArray = this.getBindHeadersDataModelListArray(headers);

        // create data bindArray
        this.dataArray = this.buildDataArray(bindArray, csvRecordsArray);

        //this.logObject = this.dataArray;

        this.currentStep++;

      };

    }
  }

  sendDataToServer(){
    this.service.addAll(this.dataArray).subscribe((data)=>{
      this.dataFromServer = data;
      this.dataSentToServer=true;
      this.updateData.emit(data);
      this.currentStep = 3;
    });
  }

}
