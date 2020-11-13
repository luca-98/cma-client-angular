import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { removeSignAndLowerCase } from 'src/app/shared/share-func';

declare var $: any;

@Component({
  selector: 'app-auto-disease',
  templateUrl: './auto-disease.component.html',
  styleUrls: ['./auto-disease.component.scss']
})
export class AutoDiseaseComponent implements OnInit {

  isDisplay = false;
  sourceList = [];
  listData = [];
  indexSelect = 0;

  @Input() autocomplete: any;
  @Input() keySearch: number;
  @Input() set datas(value: any) {
    this.sourceList = value;
    this.listData = JSON.parse(JSON.stringify(value));
    if (this.listData.length !== 0) {
      this.indexSelect = 0;
      this.isDisplay = true;
    } else {
      return;
    }
    if (this.keySearch) {
      for (const data of this.listData) {
        const raw = data[this.keySearch];
        const dataInp = removeSignAndLowerCase(this.autocomplete.value);
        const dataDB = removeSignAndLowerCase(raw);
        const indexStart = dataDB.indexOf(dataInp);
        const indexEnd = indexStart + dataInp.length;

        data[this.keySearch] = `${raw.substring(0, indexStart)}<strong>${raw.substring(indexStart, indexEnd)}</strong>${raw.substring(indexEnd)}`;
      }
    }
  }
  @Output() selectedRow = new EventEmitter<any>();
  @ViewChild('tableBody') tableBody: ElementRef;

  constructor() { }

  ngOnInit(): void {
    $(this.autocomplete).keydown((event: any) => {
      if (event.keyCode === 27) {
        this.isDisplay = false;
      }
      if (event.keyCode === 40 && this.indexSelect < this.listData.length - 1) {
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
      if (this.listData.length !== 0) {
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
