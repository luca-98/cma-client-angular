import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/service/common.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { TemplateReportService } from 'src/app/core/service/template-report.service';
import { EditorComponent } from 'src/app/editor/editor.component';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { ContextMenuComponent } from './context-menu/context-menu.component';

declare var $: any;

@Component({
  selector: 'app-add-edit-template',
  templateUrl: './add-edit-template.component.html',
  styleUrls: ['./add-edit-template.component.scss']
})
export class AddEditTemplateComponent implements OnInit, AfterViewInit {

  listTemplate = [];
  title = '';
  editor: any;
  currentId: string;
  dragDropItem = [];
  reportName: string;
  parentGroupId = '0';
  groups = [];
  @ViewChild(EditorComponent, { static: false }) editorComponent: EditorComponent;
  @ViewChild(ContextMenuComponent, { static: false }) contextMenu: ContextMenuComponent;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private templateReportService: TemplateReportService,
    private router: Router,
    private sideMenuService: SideMenuService,
    private titleService: Title,
  ) {
    this.route.queryParams.subscribe(params => {
      this.currentId = params.id;
    });
  }

  ngOnInit(): void {
    this.sideMenuService.changeItem(4.3);
    if (this.currentId === undefined) {
      this.titleService.setTitle('Thêm mới mẫu kết quả dịch vụ');
      this.title = this.titleService.getTitle();
    } else {
      this.titleService.setTitle('Chỉnh sửa mẫu kết quả dịch vụ');
      this.title = this.titleService.getTitle();
    }
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

  async initData() {
    this.buildDragDropItem();
    await this.getAllGroupTemplateReport();
    await this.getAllTemplateReport();
    if (this.currentId !== undefined) {
      await this.getTemplateReport();
    }
  }

  async getAllTemplateReport() {
    await this.templateReportService.getAllTemplateReport()
      .toPromise()
      .then(
        (data: any) => {
          if (data.message) {
            this.listTemplate = data.message;
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
        }
      );
  }

  buildDragDropItem() {
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
      name: 'Kết luận',
      type: 'textarea',
      id: 'result'
    });
    this.dragDropItem.push({
      name: 'Ghi chú',
      type: 'textarea',
      id: 'note'
    });
    this.dragDropItem.push({
      name: 'Ngày tháng',
      type: 'special',
      id: 'date'
    });
    this.dragDropItem.push({
      name: 'Tên bác sĩ thực hiện',
      type: 'text',
      id: 'staffName'
    });
  }

  async getAllGroupTemplateReport() {
    await this.templateReportService.getAllGroupTemplateReport()
      .toPromise()
      .then(
        (data: any) => {
          if (data.message) {
            this.groups = data.message;
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
        }
      );
  }

  async getTemplateReport() {
    await this.templateReportService.getOneTemplateReport(this.currentId)
      .toPromise()
      .then(
        (data: any) => {
          if (data.message.templateReportId != null) {
            this.reportName = data.message.templateName;
            this.parentGroupId = data.message.groupId ? data.message.groupId : '0';
            this.editorComponent.setContentEditor(data.message.htmlReport);
            this.setEventMenuContextOnEdit();
          } else {
            this.router.navigate(['/manage-service/template-report/edit']);
          }
        },
        () => {
          this.router.navigate(['/manage-service/template-report/edit']);
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
    const id = this.currentId === undefined ? null : this.currentId;
    let templateName = this.reportName;
    if (templateName === undefined || templateName.trim() === '') {
      this.openNotifyDialog('Lỗi', 'Tên của mẫu kết quả dịch vụ không được để trống');
      return;
    }
    templateName = templateName.trim();
    for (const e of this.listTemplate) {
      if (templateName == e.templateName && e.templateReportId != id) {
        this.openNotifyDialog('Lỗi', 'Tên của mẫu kết quả dịch vụ đã tồn tại');
        return;
      }
    }
    const groupId = this.parentGroupId === '0' ? null : this.parentGroupId;


    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn lưu kết quả dịch vụ này không này không?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editorComponent.disableColResize();
        this.editorComponent.freezeInput();
        this.editorComponent.fixTdTag();
        $('#editor textarea').each(function () {
          $(this).html($(this).val());
        });
        const htmlReport = this.editor.innerHTML;
        this.editorComponent.enableColResize();
        this.editorComponent.unFreezeInput();
        this.templateReportService.updateTemplateReport(id, templateName, htmlReport, groupId)
          .subscribe(
            (data: any) => {
              this.currentId = data.message.templateReportId;
              this.openNotifyDialog('Thông báo', 'Lưu kết quả dịch vụ thành công');
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
        if (item.id === 'date') {
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
        iTag.innerHTML = item.name;
        appendNode.appendChild(iTag);
      } else if (item.type === 'textarea') {
        const checkNode = document.getElementById(item.id);
        if (checkNode !== null) {
          thisComponent.openNotifyDialog('Lỗi', `Không thể thêm mới, ${item.name} đã tồn tại`);
          return;
        }
        appendNode = document.createElement('div');
        const contentNode = document.createElement('textarea');
        contentNode.style.border = 'none';
        contentNode.style.resize = 'none';
        contentNode.style.width = '100%';
        contentNode.style.fontWeight = 'bold';
        contentNode.style.whiteSpace = 'pre-line';
        contentNode.style.padding = '0';
        contentNode.style.lineHeight = 'normal';
        contentNode.style.marginTop = '7px';
        contentNode.style.fontSize = '18px';
        contentNode.style.fontFamily = '"Times New Roman",Times,serif';
        contentNode.setAttribute('placeholder', `Nhập ${item.name.toLowerCase()}`);
        contentNode.setAttribute('rows', '1');
        contentNode.setAttribute('id', item.id);
        appendNode.appendChild(contentNode);
      }

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
      thisComponent.editorComponent.setAutoDate();
      thisComponent.editorComponent.initTextArea();
      return false;
    });
  }
}
