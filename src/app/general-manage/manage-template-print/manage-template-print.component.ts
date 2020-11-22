import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/core/service/common.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';

@Component({
  selector: 'app-manage-template-print',
  templateUrl: './manage-template-print.component.html',
  styleUrls: ['./manage-template-print.component.scss']
})
export class ManageTemplatePrintComponent implements OnInit {

  listTemplatePrint = [];

  constructor(
    private sideMenuService: SideMenuService,
    private titleService: Title,
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Quản lý phiếu in');
    this.sideMenuService.changeItem(8.3);
    this.getListPrintTemplate();
  }


  getListPrintTemplate() {
    this.commonService.getListPrintTemplate()
      .subscribe(
        (data: any) => {
          this.listTemplatePrint = data.message;
        },
        () => {
          console.error('get data failed');
        }
      );
  }

  moveToEdit(id: any) {
    this.router.navigate(['/general-manage/manage-template-report/edit'], { queryParams: { id } });
  }
}
