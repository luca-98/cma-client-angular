import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SideMenuService } from 'src/app/core/service/side-menu.service';

@Component({
  selector: 'app-sm-general-manage',
  templateUrl: './sm-general-manage.component.html',
  styleUrls: ['./sm-general-manage.component.scss', '../side-menu.scss']
})
export class SmGeneralManageComponent implements OnInit {

  currentItem: number;

  constructor(
    private sideMenuService: SideMenuService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.sideMenuService.changeItemSubject.subscribe((value: number) => {
      this.currentItem = value;
      changeDetectorRef.detectChanges();
    });
  }

  ngOnInit(): void {
  }

}
