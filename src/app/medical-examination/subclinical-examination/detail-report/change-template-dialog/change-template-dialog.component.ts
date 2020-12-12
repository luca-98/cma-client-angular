import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TemplateReportService } from 'src/app/core/service/template-report.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';

@Component({
  selector: 'app-change-template-dialog',
  templateUrl: './change-template-dialog.component.html',
  styleUrls: ['./change-template-dialog.component.scss']
})
export class ChangeTemplateDialogComponent implements OnInit {

  listTemplate = [];
  listGroupTemplate = [];
  formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ChangeTemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private templateReportService: TemplateReportService,
  ) { }

  ngOnInit(): void {
    this.initData();
    this.formGroup = this.formBuilder.group({
      groupTemplate: '0',
      template: '0'
    });
  }

  openNotifyDialog(title: string, content: string) {
    return this.dialog.open(NotifyDialogComponent, {
      width: '350px',
      disableClose: true,
      autoFocus: false,
      data: {
        title,
        content
      },
    });
  }

  async initData() {
    await this.getAllTemplateReport();
    await this.getAllGroupTemplateReport();

    let groupTemp = '0';
    let templateTemp = '0';

    const template = this.listTemplate.find(x => x.templateReportId === this.data.currentTemplateId);
    if (template !== null && template !== undefined) {
      templateTemp = template.templateReportId;
      const group = this.listGroupTemplate.find(x => x.id === template.groupId);
      if (group !== null && group !== undefined) {
        groupTemp = group.id;
        for (const e of this.listTemplate) {
          if (e.groupId === group.id) {
            e.isShow = true;
          }
        }
      } else {
        for (const e of this.listTemplate) {
          e.isShow = true;
        }
      }
    } else  {
      for (const e of this.listTemplate) {
        e.isShow = true;
      }
    }

    this.formGroup.patchValue({
      groupTemplate: groupTemp,
      template: templateTemp
    });
  }

  async getAllTemplateReport() {
    await this.templateReportService.getAllTemplateReport()
      .toPromise()
      .then(
        (data: any) => {
          if (data.message) {
            this.listTemplate = data.message;
            for (const e of this.listTemplate) {
              e.isShow = false;
            }
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
          this.dialogRef.close({});
        }
      );
  }

  async getAllGroupTemplateReport() {
    await this.templateReportService.getAllGroupTemplateReport()
      .toPromise()
      .then(
        (data: any) => {
          if (data.message) {
            this.listGroupTemplate = data.message;
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
          this.dialogRef.close({});
        }
      );
  }

  submit() {
    for (const template of this.listTemplate) {
      if (template.templateReportId === this.formGroup.get('template').value) {
        delete template.isShow;
        this.dialogRef.close({
          template
        });
        return;
      }
    }
    this.dialogRef.close({
      clear: true
    });
  }

  groupChange(event: any) {
    if (event.value === '0') {
      for (const e of this.listTemplate) {
        e.isShow = true;
      }
      return;
    }
    for (const e of this.listTemplate) {
      if (e.groupId === event.value) {
        e.isShow = true;
      } else {
        e.isShow = false;
      }
    }
    for (const e of this.listTemplate) {
      if (e.isShow && this.formGroup.get('template').value === e.templateReportId) {
        return;
      }
    }
    this.formGroup.patchValue({
      template: '0'
    });
  }
}
