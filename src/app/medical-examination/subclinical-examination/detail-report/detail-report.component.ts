import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MedicalExaminationService } from 'src/app/core/service/medical-examination.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { SubclinicalService } from 'src/app/core/service/subclinical.service';
import { TemplateReportService } from 'src/app/core/service/template-report.service';
import { EditorComponent } from 'src/app/editor/editor.component';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { convertDateToNormal } from 'src/app/shared/share-func';
import { environment } from 'src/environments/environment';
import { ChangeTemplateDialogComponent } from './change-template-dialog/change-template-dialog.component';

declare var $: any;

@Component({
  selector: 'app-detail-report',
  templateUrl: './detail-report.component.html',
  styleUrls: ['./detail-report.component.scss']
})
export class DetailReportComponent implements OnInit, AfterViewInit {

  @Input() medicalExamId: any;
  @Input() itemService: any;
  @Input() patientForm: any;
  @ViewChild(EditorComponent, { static: false }) editorComponent: EditorComponent;

  editor: any;
  listTemplate = [];
  listGroupTemplate = [];
  currentService = {
    templateName: '',
    templateReportId: ''
  };
  medicalExam = null;

  listImage = [];

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private templateReportService: TemplateReportService,
    private credentialsService: CredentialsService,
    private medicalExaminationService: MedicalExaminationService,
    private router: Router,
    private subclinicalService: SubclinicalService,
  ) { }

  ngOnInit(): void {
    this.sideMenuService.changeItem(1.5);
    this.getMedicalExam();
  }

  ngAfterViewInit(): void {
    this.editor = document.getElementById('editor');
    this.titleService.setTitle(
      `${this.patientForm.get('patientName').value.trim()} - ${this.itemService.serviceName}`
    );
  }

  back() {
    const note: any = document.getElementById('note');
    const result: any = document.getElementById('result');
    if (note !== null) {
      this.itemService.note = note.value;
    }
    if (result !== null) {
      this.itemService.summary = result.value;
    }

    this.editorComponent.disableColResize();
    this.editorComponent.freezeInput();
    this.editorComponent.fixTdTag();
    $('#editor textarea').each(function () {
      $(this).html($(this).val());
    });
    this.itemService.htmlReport = this.editor.innerHTML;
    this.editorComponent.enableColResize();
    this.editorComponent.unFreezeInput();
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

  openConfirmDialog(title: string, content: string) {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      disableClose: true,
      autoFocus: false,
      data: {
        title,
        content
      },
    });
  }

  getMedicalExam() {
    this.medicalExaminationService.getMedicalExam(this.medicalExamId)
      .subscribe(
        (data: any) => {
          this.medicalExam = data.message;
          this.getService();
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
        }
      );
  }

  getService() {
    if (this.itemService.serviceId === undefined) {
      this.itemService.serviceId = this.itemService.id;
    }
    this.commonService.getServiceById(this.itemService.serviceId)
      .subscribe(
        (data: any) => {
          this.currentService = {
            templateName: data.message.templateReport.templateName,
            templateReportId: data.message.templateReport.templateReportId
          };
          this.initContent();
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
        }
      );
  }

  changeTemplate() {
    if (!(this.itemService.htmlReport === undefined || this.itemService.htmlReport === null || this.itemService.htmlReport.trim() === '')) {
      const dialogRefConfirm = this.openConfirmDialog('Thông báo', 'Thao tác đổi mẫu kết quả sẽ làm mất kết quả khám hiện tại, bạn có muốn tiếp tục?');
      dialogRefConfirm.afterClosed().subscribe(resultConfirm => {
        if (resultConfirm) {
          this.openDialogChange();
        }
      });
    } else {
      this.openDialogChange();
    }
  }

  openDialogChange() {
    const dialogRef = this.dialog.open(ChangeTemplateDialogComponent, {
      width: '450px',
      disableClose: true,
      autoFocus: true,
      data: {
        currentTemplateId: this.currentService.templateReportId
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.clear) {
          this.currentService = {
            templateName: '',
            templateReportId: ''
          };
          this.editorComponent.setContentEditor('');
        } else {
          this.templateReportService.getOneTemplateReport(result.template.templateReportId)
            .subscribe(
              (data: any) => {
                this.currentService = {
                  templateName: result.template.templateName,
                  templateReportId: result.template.templateReportId
                };
                this.editorComponent.setContentEditor(data.message.htmlReport);
                this.processDataReport();
              },
              () => {
                this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
              }
            );
        }
      }
    });
  }

  changeStatus(item: any) {
    if (item.serviceReportId === undefined || item.serviceReportId === null || item.serviceReportId === '') {
      item.status = '2';
      return;
    }
    this.subclinicalService.changeStatus(item.serviceReportId, 2).subscribe(
      (data: any) => {
        if (data.message) {
          item.status = '2';
        }
      }, (err) => {
        console.log('cant make done');
      }
    );
  }

  initContent() {
    this.changeStatus(this.itemService);
    if (this.itemService.htmlReport === undefined || this.itemService.htmlReport === null || this.itemService.htmlReport.trim() === '') {
      if (this.currentService.templateReportId !== null && this.currentService.templateReportId !== '') {
        this.templateReportService.getOneTemplateReport(this.currentService.templateReportId)
          .subscribe(
            (data: any) => {
              this.itemService.htmlReport = data.message.htmlReport;
              this.editorComponent.setContentEditor(this.itemService.htmlReport);
              this.processDataReport();
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
            }
          );
      } else {
        this.itemService.htmlReport = '';
        this.editorComponent.setContentEditor(this.itemService.htmlReport);
      }
    } else {
      this.editorComponent.setContentEditor(this.itemService.htmlReport);
      this.processDataReport();
    }

    this.subclinicalService.getAllImage(this.itemService.serviceReportId)
      .subscribe(
        (data: any) => {
          for (const e of data.message) {
            this.listImage.push({
              id: e,
              link: this.buildUrl(e)
            });
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }

  save() {
    const dialogRefConfirm = this.openConfirmDialog('Thông báo', 'Bạn có muốn lưu kết quả khám này?');
    dialogRefConfirm.afterClosed().subscribe(resultConfirm => {
      if (resultConfirm) {
        const note: any = document.getElementById('note');
        const result: any = document.getElementById('result');
        if (note !== null) {
          this.itemService.note = note.value;
        }
        if (result !== null) {
          this.itemService.summary = result.value;
        }

        this.editorComponent.disableColResize();
        this.editorComponent.freezeInput();
        this.editorComponent.fixTdTag();
        $('#editor textarea').each(function () {
          $(this).html($(this).val());
        });
        this.itemService.htmlReport = this.editor.innerHTML;
        this.editorComponent.enableColResize();
        this.editorComponent.unFreezeInput();

        this.commonService.updateServiceReport(this.itemService.serviceReportId,
          this.itemService.note, this.itemService.summary, this.itemService.htmlReport)
          .subscribe(
            (data: any) => {
              const dialogRef = this.openNotifyDialog('Thông báo', 'Lưu kết quả khám thành công');
              dialogRef.afterClosed().subscribe(() => {
                this.router.navigate(['/medical-examination/subclinical-examination'], {
                  queryParams: { medicalExamId: this.medicalExamId }
                });
              });
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  print() {
    const thisComponent = this;
    this.editorComponent.disableColResize();
    $('#editor').printThis({ importCSS: false });
    setTimeout(function () {
      thisComponent.editorComponent.enableColResize();
    }, 1500);
  }

  processDataReport() {
    const objectPrint = {
      medicalExaminationCode: this.medicalExam.medicalExaminationCode,
      patientCode: this.patientForm.get('patientCode').value.trim(),
      patientName: this.patientForm.get('patientName').value.trim(),
      gender: this.patientForm.get('gender').value === 0 ? 'Nam' : 'Nữ',
      phone: this.patientForm.get('phone').value.trim(),
      dateOfBirth: convertDateToNormal(this.patientForm.get('dateOfBirth').value),
      address: this.patientForm.get('address').value.trim(),
      staffName: this.credentialsService.credentials.fullName
    };
    const keySet = Object.keys(objectPrint);
    for (const key of keySet) {
      const ele = document.getElementById(key);
      if (ele !== null) {
        ele.innerHTML = objectPrint[key];
      }
    }
    this.editorComponent.setAutoDate();
  }

  buildUrl(id: any) {
    return environment.apiUrl + '/image/small/' + id;
  }

  uploadImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.onchange = (e: any) => {
      const fileList = input.files;
      console.log(fileList);

      this.subclinicalService.uploadImage(this.itemService.serviceReportId, fileList[0])
        .subscribe(
          (data: any) => {
            this.listImage.push({
              id: data.message,
              link: this.buildUrl(data.message)
            });
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
          }
        );
    };
    input.click();
  }

  openImage(image: any) {
    const url = environment.apiUrl + '/image/full/' + image.id;
    this.popupCenter(url, `${this.patientForm.get('patientName').value.trim()} - Hình ảnh`, 800, 2000);
  }

  popupCenter(url: string, title: string, w: number, h: number) {
    // Fixes dual-screen position
    const dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;

    // tslint:disable-next-line: max-line-length
    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    // tslint:disable-next-line: max-line-length
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const left = ((width / 2) - (w / 2)) + dualScreenLeft;
    const top = ((height / 2) - (h / 2)) + dualScreenTop;
    const newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
      newWindow.focus();
    }
  }

  deleteImage(image: any) {
    this.subclinicalService.deleteImage(image.id)
      .subscribe(
        (data: any) => {
          const index = this.listImage.findIndex(x => x.id === image.id);
          this.listImage.splice(index, 1);
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }
}
