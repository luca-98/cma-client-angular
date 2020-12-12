import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { CollectPayCashComponent } from 'src/app/shared/dialogs/collect-pay-cash/collect-pay-cash.component';

@Component({
  selector: 'app-sm-finance',
  templateUrl: './sm-finance.component.html',
  styleUrls: ['./sm-finance.component.scss', '../side-menu.scss']
})
export class SmFinanceComponent implements OnInit {
  currentItem: number;
  userPermissionCode = [];

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
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

  navigateRevenueExpenditure() {
    if (this.router.url !== '/manage-finance/manage-revenue-expenditure') {
      this.router.navigate(['/manage-finance/manage-revenue-expenditure']);
    } else {
      location.reload();
    }
    this.titleService.setTitle('Quản lý thu chi');
    this.sideMenuService.changeItem(5.5);
  }

  openCollectCashDialog() {
    const dialogRef = this.dialog.open(CollectPayCashComponent, {
      width: '500px',
      disableClose: true,
      autoFocus: false,
      data: {
        type: 2
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.navigateRevenueExpenditure();
    });
  }

  openPaymentCashDialog() {
    const dialogRef = this.dialog.open(CollectPayCashComponent, {
      width: '500px',
      disableClose: true,
      autoFocus: false,
      data: {
        type: 1
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.navigateRevenueExpenditure();
    });
  }



}
