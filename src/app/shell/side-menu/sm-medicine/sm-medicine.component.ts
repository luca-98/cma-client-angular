import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SideMenuService } from 'src/app/core/service/side-menu.service';

@Component({
  selector: 'app-sm-medicine',
  templateUrl: './sm-medicine.component.html',
  styleUrls: ['./sm-medicine.component.scss', '../side-menu.scss']
})
export class SmMedicineComponent implements OnInit {
  currentItem: number;

  constructor(
    private sideMenuService: SideMenuService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.sideMenuService.changeItemSubject.subscribe((value: number) => {
      this.currentItem = value;
      changeDetectorRef.detectChanges();
    });
  }
  ngOnInit(): void {
  }

}
