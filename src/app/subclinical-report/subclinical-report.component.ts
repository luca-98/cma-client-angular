import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../core/service/common.service';
import { NotifyDialogComponent } from '../shared/dialogs/notify-dialog/notify-dialog.component';

@Component({
  selector: 'app-subclinical-report',
  templateUrl: './subclinical-report.component.html',
  styleUrls: ['./subclinical-report.component.scss']
})
export class SubclinicalReportComponent implements OnInit {
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
    this.commonService.getSubClinicaById(this.id)
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
