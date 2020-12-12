import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { CredentialsService } from '../core/service/credentials.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private credentialsService: CredentialsService
  ) { }

  ngOnInit(): void {
    const userPermissionCode = this.credentialsService.credentials.permissionCode;
    let index = userPermissionCode.findIndex(x => x == 'A00');
    if (index != -1) {
      this.router.navigate(['/medical-examination']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'B00');
    if (index != -1) {
      this.router.navigate(['/manage-medicine']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'C00');
    if (index != -1) {
      this.router.navigate(['/manage-material']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'D00');
    if (index != -1) {
      this.router.navigate(['/manage-service']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'E00');
    if (index != -1) {
      this.router.navigate(['/manage-finance']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'F00');
    if (index != -1) {
      this.router.navigate(['/report']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'G00');
    if (index != -1) {
      this.router.navigate(['/general-manage']);
      return;
    }
  }
}
