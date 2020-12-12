import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService } from '../core/service/credentials.service';

@Component({
  selector: 'app-general-manage',
  templateUrl: './general-manage.component.html',
  styleUrls: ['./general-manage.component.scss']
})
export class GeneralManageComponent implements OnInit {

  constructor(
    private router: Router,
    private credentialsService: CredentialsService
  ) { }

  ngOnInit(): void {
    const userPermissionCode = this.credentialsService.credentials.permissionCode;
    let index = userPermissionCode.findIndex(x => x == 'G10');
    if (index != -1) {
      this.router.navigate(['/general-manage/manage-user']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'G20');
    if (index != -1) {
      this.router.navigate(['/general-manage/manage-user-group']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'G30');
    if (index != -1) {
      this.router.navigate(['/general-manage/manage-template-report']);
      return;
    }
  }

}
