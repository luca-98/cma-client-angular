import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SideMenuService } from 'src/app/core/service/side-menu.service';

@Component({
  selector: 'app-sm-materials',
  templateUrl: './sm-materials.component.html',
  styleUrls: ['./sm-materials.component.scss', '../side-menu.scss']
})
export class SmMaterialsComponent implements OnInit {
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
