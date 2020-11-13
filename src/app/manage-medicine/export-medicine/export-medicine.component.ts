import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SideMenuService } from 'src/app/core/service/side-menu.service';

@Component({
  selector: 'app-export-medicine',
  templateUrl: './export-medicine.component.html',
  styleUrls: ['./export-medicine.component.scss']
})
export class ExportMedicineComponent implements OnInit {

  
  constructor(private titleService: Title,
    private sideMenuService: SideMenuService) { }

  ngOnInit(): void {
    this.titleService.setTitle('Xuất bán thuốc');
    this.sideMenuService.changeItem(2.3);
  }
  
 


}
