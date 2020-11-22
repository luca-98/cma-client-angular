import { ElementRef, HostListener, ViewChild } from '@angular/core';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { PatientDTO } from 'src/app/model/patient-dto';
import { removeSignAndLowerCase } from '../share-func';

declare var $: any;

@Component({
  selector: 'app-patient-autocomplete',
  templateUrl: './patient-autocomplete.component.html',
  styleUrls: ['./patient-autocomplete.component.scss']
})
export class PatientAutocompleteComponent implements OnInit {
  isDisplay = false;
  sourceList: PatientDTO[] = [];
  listPatient: PatientDTO[] = [];
  indexSelect = 0;
  @Input() maxHeight = 200;
  @Input() isMini = false;
  @Input() autocomplete: any;
  @Input() keySearch: number;
  @Input() set patients(value: PatientDTO[]) {
    this.sourceList = value;
    this.listPatient = JSON.parse(JSON.stringify(value));
    if (this.listPatient.length !== 0) {
      this.indexSelect = 0;
      this.isDisplay = true;
    } else {
      return;
    }
    if (this.keySearch) {
      for (const patient of this.listPatient) {
        const raw = patient[this.keySearch];
        const dataInp = removeSignAndLowerCase(this.autocomplete.value);
        const dataDB = removeSignAndLowerCase(raw);
        const indexStart = dataDB.indexOf(dataInp);
        const indexEnd = indexStart + dataInp.length;

        patient[this.keySearch] = `${raw.substring(0, indexStart)}<strong>${raw.substring(indexStart, indexEnd)}</strong>${raw.substring(indexEnd)}`;
      }
    }
  }
  @Output() selectedRow = new EventEmitter<PatientDTO>();
  @ViewChild('tableBody') tableBody: ElementRef;

  constructor() { }

  ngOnInit(): void {
    $(this.autocomplete).keydown((event: any) => {
      if (event.keyCode === 27) {
        this.isDisplay = false;
      }
      if (event.keyCode === 40 && this.indexSelect < this.listPatient.length - 1) {
        this.indexSelect++;
      }
      if (event.keyCode === 38 && this.indexSelect > 0) {
        this.indexSelect--;
      }
      if (event.keyCode === 13) {
        $(this.tableBody.nativeElement).find('.selected').first().click();
      }
    });
  }

  @HostListener('document:click', ['$event'])
  clickScreen($event: MouseEvent) {
    if ($event.target === this.autocomplete) {
      if (this.listPatient.length !== 0) {
        this.isDisplay = true;
      }
      return;
    }
    this.isDisplay = false;
  }

  selectRow(id: number) {
    this.indexSelect = 0;
    for (const e of this.sourceList) {
      if (e.id === id) {
        this.selectedRow.emit(e);
        return;
      }
    }
  }

}
