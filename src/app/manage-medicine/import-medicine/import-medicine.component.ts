import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SideMenuService } from 'src/app/core/service/side-menu.service';

@Component({
  selector: 'app-import-medicine',
  templateUrl: './import-medicine.component.html',
  styleUrls: ['./import-medicine.component.scss']
})
export class ImportMedicineComponent implements OnInit {

  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  constructor(private titleService: Title,
    private sideMenuService: SideMenuService) { }

  ngOnInit(): void {
    this.titleService.setTitle('Nhập thuốc vật tư');
    this.sideMenuService.changeItem(2.1);
  }
  
  onPageEvent(event: any) {
    // (event.pageSize, event.pageIndex);
  }


}
