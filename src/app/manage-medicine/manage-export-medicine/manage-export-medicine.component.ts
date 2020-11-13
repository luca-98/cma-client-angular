import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SideMenuService } from 'src/app/core/service/side-menu.service';

@Component({
  selector: 'app-manage-export-medicine',
  templateUrl: './manage-export-medicine.component.html',
  styleUrls: ['./manage-export-medicine.component.scss']
})
export class ManageExportMedicineComponent implements OnInit {

  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  constructor(private titleService: Title,
    private sideMenuService: SideMenuService) { }

  ngOnInit(): void {
    this.titleService.setTitle('Quản lí xuất bán thuốc');
    this.sideMenuService.changeItem(2.4);
  }
  
  onPageEvent(event: any) {
    // (event.pageSize, event.pageIndex);
  }

}
