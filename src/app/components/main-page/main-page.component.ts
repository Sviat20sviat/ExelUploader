import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable, throwError } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import * as XLSX from 'xlsx';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
  altData = [];
  headerData = [];
  data = [];
  name;
  allData;
  search = '';
  defaultValuesToHide;
  config;
  access = '0';
  cardData
  constructor(
    private httpClient: HttpClient,
    public dialog: MatDialog,
    private ngxUiLoaderService: NgxUiLoaderService,
    private sharedService: SharedService
  ) {
    this.defaultValuesToHide = sharedService.defaultValuesUser;
    this.config = {
      bgsColor: 'red',
      bgsOpacity: 0.5,
      bgsPosition: 'bottom-right',
      bgsSize: 60,
      bgsType: 'ball-spin-clockwise',
      blur: 5,
      delay: 0,
      fastFadeOut: true,
      fgsColor: 'red',
      fgsPosition: 'center-center',
      fgsSize: 60,
      fgsType: 'ball-spin-clockwise',
      gap: 24,
      logoPosition: 'center-center',
      logoSize: 120,
      logoUrl: '',
      masterLoaderId: 'master',
      overlayBorderRadius: '0',
      overlayColor: 'rgba(40, 40, 40, 0.8)',
      pbColor: 'red',
      pbDirection: 'ltr',
      pbThickness: 3,
      hasProgressBar: true,
      text: '',
      textColor: '#FFFFFF',
      textPosition: 'center-center',
      maxTime: -1,
      minTime: 300,
    };
  }

  ngOnInit(): void { 
    console.log("this.altData",this.altData);
    
  }

  onFileChanged(event) {
    this.cardData = [];
    this.ngxUiLoaderService.startLoader('main-dialog');
    console.log('changed!');
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length > 1) {
      throw new Error('Cant Use Multiple Files!');
    }
    const reader = new FileReader();
    reader.onload = (el) => {
      const bsstr = el.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bsstr, { type: 'binary' });
      const wsName = wb.SheetNames[0];
      this.name = wsName;
      const ws: XLSX.WorkSheet = wb.Sheets[wsName];
      console.log(ws);
      const tableData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      //this.altData = (XLSX.utils.sheet_to_json(ws, { header: 1 }));
      const headers: any = XLSX.utils.sheet_to_json(ws, { header: 1 })[0];
      this.data = [];
      this.headerData = [];
      headers.forEach((element) => {
        console.log({ title: element, visible: true });

        this.headerData.push({ title: element, visible: true });
      });
      console.log("tableData", tableData);
      
      tableData.forEach((el: Array<any>, index) => {
        if (index > 0) {
          let arr = [];
          el.forEach((e) => {
            arr.push({ title: e, visible: true });
          });
          this.data.push(arr);
          this.altData.push(arr);
          if (index == tableData.length - 1) {
            console.log('last!!');

            this.untoggleDefault(this.defaultValuesToHide);
            this.ngxUiLoaderService.stopLoader('main-dialog');
          }
        }
      });
      let lineHeaders
      tableData.forEach((line: Array<any>, LKindex) => { 
        let lineData = {index: LKindex, head:null};
        if(LKindex == 1) {
          lineHeaders = line;
          console.log("lineHeaders",lineHeaders);
          
        } else {
          line.forEach((l, i) => {
            let head = lineHeaders[i]
            lineData.head = {headName: head, data: l};
          });
        };
        if (lineData) {
          this.cardData.push(lineData);
        }
      })
      console.log(" this.cardData",  this.cardData);
      
      console.log(this.altData);
    };
    reader.readAsBinaryString(target.files[0]);
    
    
  }
  onHover() {
    console.log('Hover!!)');
  }
  onSearchChange(value) {
    console.log('value');

    this.search = value.toLowerCase;
    if (!value) {
      this.data = [...this.altData];
      return;
    }
    this.data = [];
    this.altData.forEach((row, i) => {
      let filteredRow = row.filter(
        (p) =>
          p.title
            .toString()
            .toLowerCase()
            .indexOf(value.toString().toLowerCase()) !== -1
      );

      if (filteredRow && filteredRow.length > 0) {
        this.data.push(row);
      }
    });
  }
  openSettingsDialog() {
    console.log('settings');
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      // width: '670px',
      height: '470px',
      panelClass: 'no-resize',
      data: { data: this.headerData, access: this.access },
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.access = res.access;
      console.log(res);

      res.headersData.forEach((el) => {
        if (!el.visible) {
          const index = this.headerData.findIndex((e) => e.title === el.title);
          if (index > -1) {
            this.data.forEach((el) => {
              if (el[index]?.visible && el[index].visible == true) {
                el[index].visible = false;
              }
            });
          }
        } else {
          const index = this.headerData.findIndex((e) => e.title === el.title);
          if (index > -1) {
            this.data.forEach((el) => {
              if (el[index]?.visible == false) {
                el[index].visible = true;
              }
            });
          }
        }
      });
      if (res.access == '0') {
        this.untoggleDefault(res.untoggle);
      }
    });
  }
  untoggleDefault(values) {
    values.forEach((el) => {
      const index = this.headerData.findIndex((e) => e.title == el);

      if (index > -1) {
        this.headerData[index].visible = false;
        this.data.forEach((el) => {
          if (el[index]?.visible && el[index].visible == true) {
            el[index].visible = false;
          }
        });
      }
    });
  }
}
