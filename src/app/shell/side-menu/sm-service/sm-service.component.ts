import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SideMenuService } from 'src/app/core/service/side-menu.service';

@Component({
  selector: 'app-sm-service',
  templateUrl: './sm-service.component.html',
  styleUrls: ['./sm-service.component.scss', '../side-menu.scss']
})
export class SmServiceComponent implements OnInit {
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
