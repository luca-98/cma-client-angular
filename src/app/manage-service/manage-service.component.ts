import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService } from '../core/service/credentials.service';

@Component({
  selector: 'app-manage-service',
  templateUrl: './manage-service.component.html',
  styleUrls: ['./manage-service.component.scss']
})
export class ManageServiceComponent implements OnInit {

  constructor(
    private router: Router,
    private credentialsService: CredentialsService
  ) { }

  ngOnInit(): void {
    const userPermissionCode = this.credentialsService.credentials.permissionCode;
    let index = userPermissionCode.findIndex(x => x == 'D10');
    if (index != -1) {
      this.router.navigate(['/manage-service/service']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'D20');
    if (index != -1) {
      this.router.navigate(['/manage-service/group-service']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'D30');
    if (index != -1) {
      this.router.navigate(['/manage-service/template-report']);
      return;
    }
  }

}
