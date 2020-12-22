import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService } from '../core/service/credentials.service';

@Component({
  selector: 'app-manage-medicine',
  templateUrl: './manage-medicine.component.html',
  styleUrls: ['./manage-medicine.component.scss']
})
export class ManageMedicineComponent implements OnInit {

  constructor(
    private router: Router,
    private credentialsService: CredentialsService
  ) { }

  ngOnInit(): void {
    const userPermissionCode = this.credentialsService.credentials.permissionCode;
    let index = userPermissionCode.findIndex(x => x == 'B20');
    if (index != -1) {
      this.router.navigate(['/manage-medicine/export-medicine']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'B10');
    if (index != -1) {
      this.router.navigate(['/manage-medicine/import-medicine']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'B30');
    if (index != -1) {
      this.router.navigate(['/manage-medicine/manage-export-medicine']);
      return;
    }
  }

}
