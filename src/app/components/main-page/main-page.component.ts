import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable, throwError } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import * as XLSX from 'xlsx';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: MatTableDataSource<any>;
  altData = [];
  headerData = [];
  data = [];
  name;
  allData;
  search = '';
  defaultValuesToHide;
  config;
  access = '0';
  cardData;
  collapsed: boolean = true;
  selectedToggleBtnGroup: boolean = true;
  selectedRow = [];
  db
  constructor(
    private httpClient: HttpClient,
    public dialog: MatDialog,
    private ngxUiLoaderService: NgxUiLoaderService,
    private sharedService: SharedService,
    private AngularFirestore: AngularFirestore
  ) {

    this.dataSource = new MatTableDataSource(ELEMENT_DATA);
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
    console.log("this.altData", this.altData);
    let data = {
      name: "qweqweqwe"
    }
    this.AngularFirestore.collection('user1').add(data).then(
      res => console.log(res)

    )
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.dataSource.paginator.firstPage();
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
      const tableData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }); //
      console.log("TABLE DATA =====>>>>", tableData);
      //this.altData = (XLSX.utils.sheet_to_json(ws, { header: 1 }));
      const headers: any = XLSX.utils.sheet_to_json(ws, { header: 1 })[0];
      this.data = [];
      this.headerData = [];
      headers.forEach((element) => {
        console.log({ title: element, visible: true });

        this.headerData.push({ title: element, visible: true });
      });
      console.log("tableData", tableData);
      // this.AngularFirestore.collection('tableCopy').add({ data: JSON.stringify(tableData) }).then(
      //   res => console.log(res)
      // )
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
        let lineData = { index: LKindex, head: null };
        if (LKindex == 0) {
          lineHeaders = line;
          console.log("lineHeaders", lineHeaders);

        } else {
          line.forEach((l, i) => {
            let head = lineHeaders[i]
            lineData.head = { headName: head, data: l };
          });
        };
        if (lineData) {
          this.cardData.push(lineData);
        }
      })
      console.log(" this.cardData", this.cardData);
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

  createCardData() {

  }
  rightSideOpened = false;
  displayedColumns = ['position', 'name', 'weight', 'symbol'];
  // dataSource = ELEMENT_DATA;
  hideRightPanel(el: HTMLDivElement, contentDiv: HTMLDivElement) {
    console.log("hideRightPanel!");
    let mainContentDiv = contentDiv.parentElement;
    let parentEl = el.parentElement.parentElement;
    parentEl.style.width = "600px";
    this.collapsed = !this.collapsed;
    this.collapsed ? mainContentDiv.style.marginRight = "0" : mainContentDiv.style.marginRight = "600px";

  }

  resizeRightSideNav(event: PointerEvent, el: HTMLDivElement, contentDiv: HTMLDivElement) {
    console.log(event, el, contentDiv);
    const mouseInit = event.pageX;
    const parentEl = el.parentElement.parentElement;
    const mainContentDiv = contentDiv.parentElement;
    const mainDivMarginInit = parseInt(mainContentDiv.style.marginRight);
    const elWidthInit = parentEl.offsetWidth;
    parentEl.style.width = elWidthInit.toString() + 'px';
    let mouseDiff = 0;
    function handleResize(e) {
      mouseDiff = mouseInit - e.pageX;
      const width = elWidthInit + mouseDiff;
      if (width < 0) { return; }
      parentEl.style.width = elWidthInit + mouseDiff + 'px';
      el.classList.add('is-resizing');
      mainContentDiv.style.marginRight = mainDivMarginInit + mouseDiff + 'px';
    }
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', handleResize);
      el.classList.remove('is-resizing');
    });
  }

  loadRightMenu(data, i) {
    console.log("loadRightMenu", data, this.allData);
    this.selectedRow = this.altData[i];
    // this.panel = !this.panel;
  }
}
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}


const ELEMENT_DATA: PeriodicElement[] = [
  { name: 'Hydrogen', weight: 1.0079, symbol: 'H', position: 1, },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];