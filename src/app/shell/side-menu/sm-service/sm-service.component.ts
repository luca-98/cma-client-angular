import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';

@Component({
  selector: 'app-sm-service',
  templateUrl: './sm-service.component.html',
  styleUrls: ['./sm-service.component.scss', '../side-menu.scss']
})
export class SmServiceComponent implements OnInit {
  currentItem: number;
  userPermissionCode = [];

  constructor(
    private sideMenuService: SideMenuService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentialsService: CredentialsService,
    private menuService: MenuService
  ) {
    this.sideMenuService.changeItemSubject.subscribe((value: number) => {
      this.currentItem = value;
      changeDetectorRef.detectChanges();
    });
    this.menuService.reloadMenu.subscribe(() => {
      this.userPermissionCode = this.credentialsService.credentials.permissionCode;
      changeDetectorRef.detectChanges();
    });
  }

  ngOnInit(): void {
    this.userPermissionCode = this.credentialsService.credentials.permissionCode;
  }

}
