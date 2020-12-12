import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

declare var $: any;

@Component({
  selector: 'app-prescription-report-dialog',
  templateUrl: './prescription-report-dialog.component.html',
  styleUrls: ['./prescription-report-dialog.component.scss']
})
export class PrescriptionReportDialogComponent implements OnInit, AfterViewInit {
  showReportContainer: any;
  id: string;
  content: string;

  constructor(
    public dialogRef: MatDialogRef<PrescriptionReportDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.content = data.content;
    this.id = data.id;
  }

  ngOnInit(): void {
    this.showReportContainer = document.getElementById('show-report-container');
  }

  ngAfterViewInit() {
    this.showReportContainer.innerHTML = this.content;
  }

  print() {
    $('#show-report-container').printThis({ importCSS: false });
  }

  openInNewWindows() {
    const url = document.location.origin + '/prescriptions-report/' + this.id;
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

}
