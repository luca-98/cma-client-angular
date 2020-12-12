import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService } from '../core/service/credentials.service';

@Component({
  selector: 'app-medical-examination',
  templateUrl: './medical-examination.component.html',
  styleUrls: ['./medical-examination.component.scss']
})
export class MedicalExaminationComponent implements OnInit {

  constructor(
    private router: Router,
    private credentialsService: CredentialsService
  ) { }

  ngOnInit(): void {
    const userPermissionCode = this.credentialsService.credentials.permissionCode;
    let index = userPermissionCode.findIndex(x => x == 'A20');
    if (index != -1) {
      this.router.navigate(['/medical-examination/receive-patient']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'A10');
    if (index != -1) {
      this.router.navigate(['/medical-examination/list-patient']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'A30');
    if (index != -1) {
      this.router.navigate(['/medical-examination/clinical-examination']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'A40');
    if (index != -1) {
      this.router.navigate(['/medical-examination/subclinical-examination']);
      return;
    }
    index = userPermissionCode.findIndex(x => x == 'A50');
    if (index != -1) {
      this.router.navigate(['/medical-examination/manage-appointment']);
      return;
    }
  }

}
