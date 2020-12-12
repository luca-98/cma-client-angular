import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubclinicalService } from 'src/app/core/service/subclinical.service';
import { environment } from 'src/environments/environment';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';

declare var $: any;

@Component({
  selector: 'app-subclinical-report-dialog',
  templateUrl: './subclinical-report-dialog.component.html',
  styleUrls: ['./subclinical-report-dialog.component.scss']
})
export class SubclinicalReportDialogComponent implements OnInit, AfterViewInit {
  showReportContainer: any;
  id: string;
  content: string;

  listImage = [];

  constructor(
    public dialogRef: MatDialogRef<SubclinicalReportDialogComponent>,
    private dialog: MatDialog,
    private subclinicalService: SubclinicalService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.content = data.content;
    this.id = data.id;
  }

  ngOnInit(): void {
    this.showReportContainer = document.getElementById('show-report-container');
    this.getAllImage();
  }

  ngAfterViewInit() {
    this.showReportContainer.innerHTML = this.content;
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

  getAllImage() {
    this.subclinicalService.getAllImage(this.id)
      .subscribe(
        (data: any) => {
          for (const e of data.message) {
            this.listImage.push({
              id: e,
              link: environment.apiUrl + '/image/small/' + e
            });
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }

  print() {
    $('#show-report-container').printThis({ importCSS: false });
  }

  openInNewWindows() {
    const url = document.location.origin + '/subclinical-report/' + this.id;
    this.popupCenter(url, 'Báo cáo chi tiết', 800, 2000);
    this.dialogRef.close();
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

  openImage(image: any) {
    const url = environment.apiUrl + '/image/full/' + image.id;
    this.popupCenter(url, 'Hình ảnh', 800, 2000);
  }
}
