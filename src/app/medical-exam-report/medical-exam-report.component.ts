import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../core/service/common.service';
import { NotifyDialogComponent } from '../shared/dialogs/notify-dialog/notify-dialog.component';

@Component({
  selector: 'app-medical-exam-report',
  templateUrl: './medical-exam-report.component.html',
  styleUrls: ['./medical-exam-report.component.scss']
})
export class MedicalExamReportComponent implements OnInit {
  id: string;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private titleService: Title,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      this.loadContent();
    });
  }

  loadContent() {
    this.commonService.getMedicalExamById(this.id)
      .subscribe(
        (res: any) => {
          this.titleService.setTitle(res.message.name);
          if (res.message.htmlReport === null) {
            this.dialog.open(NotifyDialogComponent, {
              width: '350px',
              disableClose: true,
              autoFocus: false,
              data: { title: 'Thông báo', content: 'Không có nội dung báo cáo để hiển thị' },
            });
            return;
          }
          document.getElementById('editor').innerHTML = res.message.htmlReport;
        },
        () => {
          this.dialog.open(NotifyDialogComponent, {
            width: '350px',
            disableClose: true,
            autoFocus: false,
            data: { title: 'Lỗi', content: 'Lỗi máy chủ gặp sự cố, vui lòng thử lại' },
          });
        }
      );
  }
}
