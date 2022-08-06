import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss'],
})
export class SettingsDialogComponent implements OnInit {
  headersData = [];
  itemsToHide = [];
  form: FormGroup;
  access;
  defaultValuesToHide;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    private sharedService: SharedService
  ) {
    console.log(data);
    this.defaultValuesToHide = sharedService.defaultValuesUser;
    this.headersData = data.data;
    this.access = data.access;
    this.form = new FormGroup({
      access: new FormControl('0'),
    });
  }

  ngOnInit(): void {
    this.form.setValue({
      access: this.access,
    });
    this.form.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }
  toggleSelection(index, element) {
    this.headersData[index].visible = !this.headersData[index].visible;
    console.log(this.itemsToHide);
  }
  closeAndAccept() {
    const access = this.form.get('access').value;
    let response = {
      headersData: this.headersData,
      access,
      untoggle: access == '0' ? this.sharedService.defaultValuesUser : this.sharedService.defaultValuesAdmin
    };
    this.dialogRef.close(response);
  }
  clickToUser() {
    this.form.get('access').setValue('0');
    this.headersData.forEach((r) => {
      r.visible = true;
    });
    this.untoggleDefault(this.sharedService.defaultValuesUser);
  }
  clickToAdmin() {
    this.form.get('access').setValue('1');
    this.headersData.forEach((r) => {
      r.visible = true;
    });
    this.untoggleDefault(this.sharedService.defaultValuesAdmin);
  }
  untoggleDefault(values) {
    if (!values) {
      return
    }
    values.forEach((el) => {
      const index = this.headersData.findIndex((e) => e.title == el);
      if (index > -1) {
        this.headersData[index].visible = false;
      }
    });
  }
}
