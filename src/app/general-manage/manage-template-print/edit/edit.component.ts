import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/service/common.service';
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
export class EditComponent implements OnInit {

  htmlAppoint = '<div> <table class="" id="JColResizer2" style="border-collapse: collapse; border: none; width: 100%; table-layout: fixed;"> <tbody id="tbody-appoint"> <tr style="visibility: hidden; line-height: 1px;"> <th style="width: 163px;"></th> <th style="width: 162px;"></th> <th style="width: 161px;"></th> <th style="width: 162px;"></th> </tr> <tr> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> <b>Chỉ định</b></td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> <b>Phòng khám</b></td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> <b>Bác sĩ</b></td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> <b>Thành tiền</b></td> </tr> <tr id="data"> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> none </td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> none </td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> none </td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> none </td> </tr> <tr> <td style="text-align: right; border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;" class="" colspan="3" rowspan="1"><b>Tổng tiền:</b></td> <td hidden="" style="border: none;"></td> <td hidden="" style="border: none;"></td> <td style="border-collapse: collapse; border: none; overflow-wrap: break-word; padding: 0px 6px;"> <i style="font-style: normal;" id="total">none</i> </td> </tr> </tbody> </table> <div><br></div> </div>';
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
  ) {
    this.route.queryParams.subscribe(params => {
      this.currentId = params.id;
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Chỉnh sửa mẫu in');
    this.sideMenuService.changeItem(8.3);
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
        if (item.id === 'tableAppoint') {
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
