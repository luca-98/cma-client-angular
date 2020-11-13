import { ChangeDetectorRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { SideMenuService } from 'src/app/core/service/side-menu.service';

@Component({
  selector: 'app-sm-medical-examination',
  templateUrl: './sm-medical-examination.component.html',
  styleUrls: ['./sm-medical-examination.component.scss', '../side-menu.scss']
})
export class SmMedicalExaminationComponent implements OnInit {

  currentItem: number;

  constructor(
    private sideMenuService: SideMenuService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.sideMenuService.changeItemSubject.subscribe((value: number) => {
      this.currentItem = value;
      changeDetectorRef.detectChanges();
    });
  }

  ngOnInit(): void {
  }

}
