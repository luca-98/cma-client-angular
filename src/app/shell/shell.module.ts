import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShellComponent } from './shell.component';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { SmMedicalExaminationComponent } from './side-menu/sm-medical-examination/sm-medical-examination.component';
import { SmMedicineComponent } from './side-menu/sm-medicine/sm-medicine.component';
import { SmMaterialsComponent } from './side-menu/sm-materials/sm-materials.component';
import { SmServiceComponent } from './side-menu/sm-service/sm-service.component';
import { SmFinanceComponent } from './side-menu/sm-finance/sm-finance.component';
import { SmReportComponent } from './side-menu/sm-report/sm-report.component';
import { SmStatisticalComponent } from './side-menu/sm-statistical/sm-statistical.component';
import { SmGeneralManageComponent } from './side-menu/sm-general-manage/sm-general-manage.component';
import { DialogChangeRoomComponent } from './dialog-change-room/dialog-change-room.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    ShellComponent,
    SmMedicalExaminationComponent,
    SmMedicineComponent,
    SmMaterialsComponent,
    SmServiceComponent,
    SmFinanceComponent,
    SmReportComponent,
    SmStatisticalComponent,
    SmGeneralManageComponent,
    DialogChangeRoomComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatProgressBarModule,
    MatListModule,
    MatDividerModule,
    MatDialogModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule

  ]
})
export class ShellModule { }
