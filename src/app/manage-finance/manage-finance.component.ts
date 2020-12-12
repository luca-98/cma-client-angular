import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService } from '../core/service/credentials.service';

@Component({
  selector: 'app-manage-finance',
  templateUrl: './manage-finance.component.html',
  styleUrls: ['./manage-finance.component.scss']
})
export class ManageFinanceComponent implements OnInit {

  constructor(
    private router: Router,
    private credentialsService: CredentialsService
  ) { }

  ngOnInit(): void {
    const userPermissionCode = this.credentialsService.credentials.permissionCode;
    let index = userPermissionCode.findIndex(x => x == 'E10');
    if (index != -1) {
      this.router.navigate(['/manage-finance/collect-service-fee']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'E40');
    if (index != -1) {
      this.router.navigate(['/manage-finance/collect-debt']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'E50');
    if (index != -1) {
      this.router.navigate(['/manage-finance/pay-debt']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'E60');
    if (index != -1) {
      this.router.navigate(['/manage-finance/manage-revenue-expenditure']);
      return;
    }
  }

}
