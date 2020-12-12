import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { EditorComponent } from 'src/app/editor/editor.component';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { ContextMenuComponent } from './context-menu/context-menu.component';

declare var $: any;

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, AfterViewInit {

  htmlAppoint = '<div> <table class="" id="JColResizer2" style="border-collapse: collapse; border: none; width: 100%; table-layout: fixed;"> <tbody id="tbody-appoint"> <tr style="visibility: hidden; line-height: 1px;"> <th style="width: 163px;"></th> <th style="width: 162px;"></th> <th style="width: 161px;"></th> <th style="width: 162px;"></th> </tr> <tr> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> <b>Chỉ định</b></td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> <b>Phòng khám</b></td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> <b>Bác sĩ</b></td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> <b>Thành tiền</b></td> </tr> <tr id="data"> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> none </td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> none </td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> none </td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> none </td> </tr> <tr> <td style="text-align: right; border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;" class="" colspan="3" rowspan="1"><b>Tổng tiền:</b></td> <td hidden="" style="border: none;"></td> <td hidden="" style="border: none;"></td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> <i style="font-style: normal;" id="total">none</i> </td> </tr> </tbody> </table> <div><br></div> </div>';
  htmlPrescriptions = '<div><div class="JCLRgrips" style="width: 646px;"><div class="JCLRgrip" style="left: 56px; height: 57px;"><div class="JColResizer"></div></div><div class="JCLRgrip" style="left: 253px; height: 57px;"><div class="JColResizer"></div></div><div class="JCLRgrip" style="left: 372px; height: 57px;"><div class="JColResizer"></div></div><div class="JCLRgrip JCLRLastGrip" style="left: 648px; height: 57px;"></div></div><table class="JColResizer" id="JColResizer1" style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); width: 100%; table-layout: fixed;"><tbody><tr style="visibility: hidden; line-height: 1px;"><th style="width: 55px;"></th><th style="width: 197px;"></th><th style="width: 119px;"></th><th style="width: 276px;"></th></tr><tr><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>STT</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>Tên thuốc</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>Số lượng</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>Liều lượng</b></td></tr><tr id="data"><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;none</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;none</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;none</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;none</td></tr></tbody></table></div>';
  htmlSubclinicalReport = '<div class="JCLRgrips" style="width: 646px;"><div class="JCLRgrip" style="left: 55px; height: 57px;"><div class="JColResizer"></div></div><div class="JCLRgrip" style="left: 260px; height: 57px;"><div class="JColResizer"></div></div><div class="JCLRgrip" style="left: 528px; height: 57px;"><div class="JColResizer"></div></div><div class="JCLRgrip JCLRLastGrip" style="left: 648px; height: 57px;"></div></div><table class="JColResizer" id="JColResizer1" style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); width: 100%; table-layout: fixed;"><tbody id="tbody-subclinical-report"><tr style="visibility: hidden; line-height: 1px;"><th style="width: 54px;"></th><th style="width: 205px;"></th><th style="width: 268px;"></th><th style="width: 120px;"></th></tr><tr><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class=""><b>STT</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class=""><b>Tên dịch vụ</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class=""><b>Kết quả</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class=""><b>Ghi chú</b></td></tr><tr id="data"><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;">&nbsp;</td></tr></tbody></table>';
  htmlExportMedicine = '<div class="JCLRgrips" style="width: 646px;"><div class="JCLRgrip" style="left: 60px; height: 83px;"><div class="JColResizer"></div></div><div class="JCLRgrip" style="left: 290px; height: 83px;"><div class="JColResizer"></div></div><div class="JCLRgrip" style="left: 398px; height: 83px;"><div class="JColResizer"></div></div><div class="JCLRgrip" style="left: 522px; height: 83px;"><div class="JColResizer"></div></div><div class="JCLRgrip JCLRLastGrip" style="left: 648px; height: 83px;"></div></div><table class="JColResizer" id="JColResizer1" style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); width: 100%; table-layout: fixed;"><tbody id="tbody-export-medicine"><tr style="visibility: hidden; line-height: 1px;"><th style="width: 58px;"></th><th style="width: 230px;"></th><th style="width: 108px;"></th><th style="width: 124px;"></th><th style="width: 126px;"></th></tr><tr><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>STT</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>Tên thuốc</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>Số lượng</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>Đơn giá</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;"><b>Thành tiền</b></td></tr><tr id="data"><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;">&nbsp;</td></tr><tr><td style="text-align: right; border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="" colspan="4" rowspan="1"><b>Tổng cộng</b></td><td hidden=""></td><td hidden=""></td><td hidden=""></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;"><i id="totalAmount" style="font-style: normal;"></i></td></tr></tbody></table>';
  htmlTableInvoice = '<div class="JCLRgrips" style="width: 646px;"><div class="JCLRgrip" style="left: 62px; height: 83px;"><div class="JColResizer"></div></div><div class="JCLRgrip" style="left: 320px; height: 83px;"><div class="JColResizer"></div></div><div class="JCLRgrip" style="left: 431px; height: 83px;"><div class="JColResizer"></div></div><div class="JCLRgrip" style="left: 541px; height: 83px;"><div class="JColResizer"></div></div><div class="JCLRgrip JCLRLastGrip" style="left: 648px; height: 83px;"></div></div><table class="JColResizer" id="JColResizer1" style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); width: 100%; table-layout: fixed;"><tbody id="tbody-invoice"><tr style="visibility: hidden; line-height: 1px;"><th style="width: 61px;"></th><th style="width: 258px;"></th><th style="width: 111px;"></th><th style="width: 110px;"></th><th style="width: 107px;"></th></tr><tr><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>STT</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>Dịch vụ/ thuốc</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;<b>Thành tiền</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;"><b>Thực thu</b></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;"><b>Còn nợ</b></td></tr><tr id="data"><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;">&nbsp;</td></tr><tr><td style="text-align: right; border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;" class="" colspan="2" rowspan="1"><b>Tổng cộng</b></td><td hidden="">&nbsp;</td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;"><i id="totalAmount" style="font-style: normal;"></i></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;"><i id="totalPaid" style="font-style: normal;"></i></td><td style="border-collapse: collapse; border: 1px dotted rgb(0, 0, 0); overflow-wrap: break-word; padding: 0px 6px;"><i id="totalDebt" style="font-style: normal;"></i></td></tr></tbody></table>';
  editor: any;
  currentId: string;
  printForm: any = null;
  templateName = '';
  dragDropItem = [];
  @ViewChild(EditorComponent, { static: false }) editorComponent: EditorComponent;
  @ViewChild(ContextMenuComponent, { static: false }) contextMenu: ContextMenuComponent;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private router: Router,
    private sideMenuService: SideMenuService,
    private titleService: Title,
    private menuService: MenuService,
    private credentialsService: CredentialsService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.currentId = params.id;
    });
    this.menuService.reloadMenu.subscribe(() => {
      const listPermission = route.snapshot.data.permissionCode;
      const newListPermission = this.credentialsService.credentials.permissionCode;
      for (const e of listPermission) {
        const index = newListPermission.findIndex(x => x == e);
        if (index == -1) {
          location.reload();
        }
      }
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Chỉnh sửa mẫu in');
    this.sideMenuService.changeItem(8.3);
  }

  ngAfterViewInit(): void {
    this.editor = document.getElementById('editor');
    this.setEventDropCommand();
    this.initData();
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

  initData() {
    this.commonService.getOnePrintTemplate(this.currentId)
      .subscribe(
        (data: any) => {
          if (data.message.id != null) {
            this.printForm = data.message;
            this.templateName = data.message.printName;
            const templateHtml = data.message.templateHTML;
            const printCode = data.message.printCode;
            if (printCode === 'ORDINAL') {
              // this.editorComponent.changeWidth('500px');
              this.dragDropItem.push({
                name: 'Số thứ tự',
                type: 'text',
                id: 'ordinalNumber'
              });
              this.dragDropItem.push({
                name: 'Ngày tháng',
                type: 'special',
                id: 'date2'
              });
              this.dragDropItem.push({
                name: 'Phòng khám',
                type: 'text',
                id: 'roomName'
              });
              this.dragDropItem.push({
                name: 'Tên bác sĩ',
                type: 'text',
                id: 'staffName'
              });
              this.dragDropItem.push({
                name: 'Mã bệnh nhân',
                type: 'text',
                id: 'patientCode'
              });
              this.dragDropItem.push({
                name: 'Tên bệnh nhân',
                type: 'text',
                id: 'patientName'
              });
              this.dragDropItem.push({
                name: 'Số điện thoại',
                type: 'text',
                id: 'phone'
              });
            } else if (printCode === 'APPOINT_SUBCLINICAL') {
              this.dragDropItem.push({
                name: 'Số hồ sơ',
                type: 'text',
                id: 'medicalExaminationCode'
              });
              this.dragDropItem.push({
                name: 'Mã bệnh nhân',
                type: 'text',
                id: 'patientCode'
              });
              this.dragDropItem.push({
                name: 'Tên bệnh nhân',
                type: 'text',
                id: 'patientName'
              });
              this.dragDropItem.push({
                name: 'Giới tính',
                type: 'text',
                id: 'gender'
              });
              this.dragDropItem.push({
                name: 'Số điện thoại',
                type: 'text',
                id: 'phone'
              });
              this.dragDropItem.push({
                name: 'Ngày sinh',
                type: 'text',
                id: 'dateOfBirth'
              });
              this.dragDropItem.push({
                name: 'Địa chỉ',
                type: 'text',
                id: 'address'
              });
              this.dragDropItem.push({
                name: 'Bảng chỉ định',
                type: 'special',
                id: 'tableAppoint'
              });
              this.dragDropItem.push({
                name: 'Ngày tháng',
                type: 'special',
                id: 'date'
              });
            } else if (printCode === 'MEDICAL_EXAM') {
              this.dragDropItem.push({
                name: 'Số hồ sơ',
                type: 'text',
                id: 'medicalExaminationCode'
              });
              this.dragDropItem.push({
                name: 'Mã bệnh nhân',
                type: 'text',
                id: 'patientCode'
              });
              this.dragDropItem.push({
                name: 'Tên bệnh nhân',
                type: 'text',
                id: 'patientName'
              });
              this.dragDropItem.push({
                name: 'Giới tính',
                type: 'text',
                id: 'gender'
              });
              this.dragDropItem.push({
                name: 'Số điện thoại',
                type: 'text',
                id: 'phone'
              });
              this.dragDropItem.push({
                name: 'Ngày sinh',
                type: 'text',
                id: 'dateOfBirth'
              });
              this.dragDropItem.push({
                name: 'Địa chỉ',
                type: 'text',
                id: 'address'
              });
              this.dragDropItem.push({
                name: 'Mạch',
                type: 'text',
                id: 'bloodVessel'
              });
              this.dragDropItem.push({
                name: 'Huyết áp',
                type: 'text',
                id: 'bloodPressure'
              });
              this.dragDropItem.push({
                name: 'Nhịp thở',
                type: 'text',
                id: 'breathing'
              });
              this.dragDropItem.push({
                name: 'Nhiệt độ',
                type: 'text',
                id: 'temperature'
              });
              this.dragDropItem.push({
                name: 'Chiều cao',
                type: 'text',
                id: 'height'
              });
              this.dragDropItem.push({
                name: 'Cân nặng',
                type: 'text',
                id: 'weight'
              });
              this.dragDropItem.push({
                name: 'Cân nặng',
                type: 'text',
                id: 'weight'
              });
              this.dragDropItem.push({
                name: 'Triệu chứng',
                type: 'text',
                id: 'symptom'
              });
              this.dragDropItem.push({
                name: 'Bệnh chính',
                type: 'text',
                id: 'mainDisease'
              });
              this.dragDropItem.push({
                name: 'Bệnh phụ',
                type: 'text',
                id: 'extraDisease'
              });
              this.dragDropItem.push({
                name: 'Kết luận',
                type: 'text',
                id: 'summary'
              });
              this.dragDropItem.push({
                name: 'Ngày tháng',
                type: 'special',
                id: 'date'
              });
            } else if (printCode === 'PRESCRIPTIONS') {
              this.dragDropItem.push({
                name: 'Số hồ sơ',
                type: 'text',
                id: 'medicalExaminationCode'
              });
              this.dragDropItem.push({
                name: 'Mã bệnh nhân',
                type: 'text',
                id: 'patientCode'
              });
              this.dragDropItem.push({
                name: 'Tên bệnh nhân',
                type: 'text',
                id: 'patientName'
              });
              this.dragDropItem.push({
                name: 'Giới tính',
                type: 'text',
                id: 'gender'
              });
              this.dragDropItem.push({
                name: 'Số điện thoại',
                type: 'text',
                id: 'phone'
              });
              this.dragDropItem.push({
                name: 'Ngày sinh',
                type: 'text',
                id: 'dateOfBirth'
              });
              this.dragDropItem.push({
                name: 'Địa chỉ',
                type: 'text',
                id: 'address'
              });
              this.dragDropItem.push({
                name: 'Bảng đơn thuốc',
                type: 'special',
                id: 'tablePrescriptions'
              });
              this.dragDropItem.push({
                name: 'Lời dặn',
                type: 'text',
                id: 'note'
              });
              this.dragDropItem.push({
                name: 'Ngày tháng',
                type: 'special',
                id: 'date'
              });
              this.dragDropItem.push({
                name: 'Tên bác sĩ',
                type: 'text',
                id: 'staffName'
              });
            } else if (printCode === 'SUBCLINICAL_REPORT') {
              this.dragDropItem.push({
                name: 'Số hồ sơ',
                type: 'text',
                id: 'medicalExaminationCode'
              });
              this.dragDropItem.push({
                name: 'Mã bệnh nhân',
                type: 'text',
                id: 'patientCode'
              });
              this.dragDropItem.push({
                name: 'Tên bệnh nhân',
                type: 'text',
                id: 'patientName'
              });
              this.dragDropItem.push({
                name: 'Giới tính',
                type: 'text',
                id: 'gender'
              });
              this.dragDropItem.push({
                name: 'Số điện thoại',
                type: 'text',
                id: 'phone'
              });
              this.dragDropItem.push({
                name: 'Ngày sinh',
                type: 'text',
                id: 'dateOfBirth'
              });
              this.dragDropItem.push({
                name: 'Địa chỉ',
                type: 'text',
                id: 'address'
              });
              this.dragDropItem.push({
                name: 'Bảng kết quả dịch vụ CLS',
                type: 'special',
                id: 'tableSubclinicalReport'
              });
              this.dragDropItem.push({
                name: 'Ngày tháng',
                type: 'special',
                id: 'date'
              });
            } else if (printCode === 'EXPORT_MEDICINE') {
              this.dragDropItem.push({
                name: 'Mã bệnh nhân',
                type: 'text',
                id: 'patientCode'
              });
              this.dragDropItem.push({
                name: 'Tên bệnh nhân',
                type: 'text',
                id: 'patientName'
              });
              this.dragDropItem.push({
                name: 'Giới tính',
                type: 'text',
                id: 'gender'
              });
              this.dragDropItem.push({
                name: 'Số điện thoại',
                type: 'text',
                id: 'phone'
              });
              this.dragDropItem.push({
                name: 'Ngày sinh',
                type: 'text',
                id: 'dateOfBirth'
              });
              this.dragDropItem.push({
                name: 'Địa chỉ',
                type: 'text',
                id: 'address'
              });
              this.dragDropItem.push({
                name: 'Bảng thuốc',
                type: 'special',
                id: 'tableExportMedicine'
              });
              this.dragDropItem.push({
                name: 'Ngày tháng',
                type: 'special',
                id: 'date'
              });
            } else if (printCode === 'INVOICE') {
              this.dragDropItem.push({
                name: 'Mã bệnh nhân',
                type: 'text',
                id: 'patientCode'
              });
              this.dragDropItem.push({
                name: 'Tên bệnh nhân',
                type: 'text',
                id: 'patientName'
              });
              this.dragDropItem.push({
                name: 'Giới tính',
                type: 'text',
                id: 'gender'
              });
              this.dragDropItem.push({
                name: 'Số điện thoại',
                type: 'text',
                id: 'phone'
              });
              this.dragDropItem.push({
                name: 'Ngày sinh',
                type: 'text',
                id: 'dateOfBirth'
              });
              this.dragDropItem.push({
                name: 'Địa chỉ',
                type: 'text',
                id: 'address'
              });
              this.dragDropItem.push({
                name: 'Bảng chi tiết hóa đơn',
                type: 'special',
                id: 'tableInvoice'
              });
              this.dragDropItem.push({
                name: 'Ngày tháng',
                type: 'special',
                id: 'date'
              });
            }
            this.editorComponent.setContentEditor(templateHtml);
            this.setEventMenuContextOnEdit();
          } else {
            this.router.navigate(['/general-manage/manage-template-report']);
          }
        },
        () => {
          this.router.navigate(['/general-manage/manage-template-report']);
          console.error('failed to get data');
        }
      );
  }

  setEventMenuContextOnEdit() {
    const thisComponent = this;
    $('[drag-drop-item=true]').each(function () {
      const ele = $(this)[0];
      ele.oncontextmenu = (event: any) => {
        event.preventDefault();
        const menuPosition = {
          positionX: event.clientX,
          positionY: event.clientY
        };
        thisComponent.contextMenu.openMenuContext(ele, menuPosition);
      };
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

  save() {
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn chỉnh sửa mẫu in này không?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editorComponent.disableColResize();
        this.editorComponent.freezeInput();
        this.editorComponent.fixTdTag();
        this.printForm.templateHTML = this.editor.innerHTML;
        this.editorComponent.enableColResize();
        this.editorComponent.unFreezeInput();
        this.commonService.savePrintTemplate(this.printForm)
          .subscribe(
            () => {
              this.openNotifyDialog('Thông báo', 'Chỉnh sửa mẫu in thành công');
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  onDragStart(event: any, item: any) {
    event.dataTransfer.setData('item', JSON.stringify(item));
  }

  setEventDropCommand() {
    const thisComponent = this;
    $(this.editor).bind('drop', function (event: any) {
      event.preventDefault();
      thisComponent.editorComponent.saveUndoRedo();

      const originalEvent = event.originalEvent;
      const item = JSON.parse(originalEvent.dataTransfer.getData('item'));
      const target = originalEvent.target;
      let appendNode: any;
      if (item.type === 'special') {
        if (item.id === 'tablePrescriptions') {
          const checkNode = document.getElementById('tbody-prescriptions');
          if (checkNode !== null) {
            thisComponent.openNotifyDialog('Lỗi', 'Không thể thêm mới, Bảng đơn thuốc đã tồn tại');
            return;
          }
          appendNode = document.createElement('i');
          appendNode.style.fontStyle = 'normal';
          appendNode.innerHTML = thisComponent.htmlPrescriptions;
        } else if (item.id === 'tableAppoint') {
          const checkNode = document.getElementById('tbody-appoint');
          if (checkNode !== null) {
            thisComponent.openNotifyDialog('Lỗi', 'Không thể thêm mới, Bảng chỉ định đã tồn tại');
            return;
          }
          appendNode = document.createElement('i');
          appendNode.style.fontStyle = 'normal';
          appendNode.innerHTML = thisComponent.htmlAppoint;
        } else if (item.id === 'date') {
          const checkNode = document.getElementById('day');
          if (checkNode !== null) {
            thisComponent.openNotifyDialog('Lỗi', 'Không thể thêm mới, Ngày tháng đã tồn tại');
            return;
          }
          appendNode = document.createElement('i');
          appendNode.style.fontStyle = 'normal';
          appendNode.appendChild(document.createTextNode('Ngày '));
          const idayTag = document.createElement('i');
          idayTag.style.fontStyle = 'normal';
          idayTag.setAttribute('id', 'day');
          idayTag.innerHTML = 'dd';
          appendNode.appendChild(idayTag);
          appendNode.appendChild(document.createTextNode(' tháng '));
          const iMonthTag = document.createElement('i');
          iMonthTag.style.fontStyle = 'normal';
          iMonthTag.setAttribute('id', 'month');
          iMonthTag.innerHTML = 'MM';
          appendNode.appendChild(iMonthTag);
          appendNode.appendChild(document.createTextNode(' năm '));
          const iYearTag = document.createElement('i');
          iYearTag.style.fontStyle = 'normal';
          iYearTag.setAttribute('id', 'year');
          iYearTag.innerHTML = 'yyyy';
          appendNode.appendChild(iYearTag);
        } else if (item.id === 'date2') {
          const checkNode = document.getElementById('date');
          if (checkNode !== null) {
            thisComponent.openNotifyDialog('Lỗi', `Không thể thêm mới, ${item.name} đã tồn tại`);
            return;
          }
          appendNode = document.createElement('i');
          appendNode.style.fontStyle = 'normal';
          const iTag = document.createElement('i');
          iTag.style.fontStyle = 'normal';
          iTag.setAttribute('id', 'date');
          iTag.innerHTML = 'dd/MM/yyyy HH:MM';
          appendNode.appendChild(iTag);
        } else if (item.id === 'tableSubclinicalReport') {
          const checkNode = document.getElementById('tbody-subclinical-report');
          if (checkNode !== null) {
            thisComponent.openNotifyDialog('Lỗi', 'Không thể thêm mới, bảng kết quả dịch vụ CLS đã tồn tại');
            return;
          }
          appendNode = document.createElement('i');
          appendNode.style.fontStyle = 'normal';
          appendNode.innerHTML = thisComponent.htmlSubclinicalReport;
        } else if (item.id === 'tableExportMedicine') {
          const checkNode = document.getElementById('tbody-export-medicine');
          if (checkNode !== null) {
            thisComponent.openNotifyDialog('Lỗi', 'Không thể thêm mới, bảng thuốc đã tồn tại');
            return;
          }
          appendNode = document.createElement('i');
          appendNode.style.fontStyle = 'normal';
          appendNode.innerHTML = thisComponent.htmlSubclinicalReport;
        } else if (item.id === 'tableInvoice') {
          const checkNode = document.getElementById('tbody-invoice');
          if (checkNode !== null) {
            thisComponent.openNotifyDialog('Lỗi', 'Không thể thêm mới, bảng chi tiết hóa đơn đã tồn tại');
            return;
          }
          appendNode = document.createElement('i');
          appendNode.style.fontStyle = 'normal';
          appendNode.innerHTML = thisComponent.htmlTableInvoice;
        }
      } else if (item.type === 'text') {
        const checkNode = document.getElementById(item.id);
        if (checkNode !== null) {
          thisComponent.openNotifyDialog('Lỗi', `Không thể thêm mới, ${item.name} đã tồn tại`);
          return;
        }
        appendNode = document.createElement('i');
        appendNode.style.fontStyle = 'normal';
        const iTag = document.createElement('i');
        iTag.style.fontStyle = 'normal';
        iTag.setAttribute('id', item.id);
        if (item.id === 'ordinalNumber') {
          iTag.innerHTML = '01';
          iTag.style.fontSize = '140px';
        } else {
          iTag.innerHTML = item.name;
        }
        appendNode.appendChild(iTag);
      }
      // else if (item.type === 'input') {

      // } else if (item.type === 'textarea') {

      // }

      appendNode.setAttribute('drag-drop-item', 'true');

      appendNode.oncontextmenu = (e: any) => {
        e.preventDefault();
        const menuPosition = {
          positionX: e.clientX,
          positionY: e.clientY
        };
        thisComponent.contextMenu.openMenuContext(appendNode, menuPosition);
      };
      target.appendChild(appendNode);
      // thisComponent.editorComponent.setAutoDate();
      thisComponent.editorComponent.initTextArea();
      return false;
    });
  }
}
