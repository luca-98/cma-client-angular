import { SupplierDTO } from 'src/app/model/supplier-dto';
import { ElementRef, HostListener, ViewChild } from '@angular/core';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { removeSignAndLowerCase } from '../share-func';

declare var $: any;

@Component({
  selector: 'app-supplier-autocomplete',
  templateUrl: './supplier-autocomplete.component.html',
  styleUrls: ['./supplier-autocomplete.component.scss']
})
export class SupplierAutocompleteComponent implements OnInit {
  isDisplay = false;
  sourceList: SupplierDTO[] = [];
  listSupplier: SupplierDTO[] = [];
  indexSelect = 0;

  @Input() maxHeight = 200;
  @Input() isMini = false;
  @Input() autocomplete: any;
  @Input() keySearch: number;
  @Input() set supplier(value: SupplierDTO[]) {
    this.sourceList = value;
    this.listSupplier = JSON.parse(JSON.stringify(value));
    if (this.listSupplier.length !== 0) {
      this.indexSelect = 0;
      this.isDisplay = true;
    } else {
      return;
    }
    if (this.keySearch) {
      for (const supplier of this.listSupplier) {
        const raw = supplier[this.keySearch];
        const dataInp = removeSignAndLowerCase(this.autocomplete.value);
        const dataDB = removeSignAndLowerCase(raw);
        const indexStart = dataDB.indexOf(dataInp);
        const indexEnd = indexStart + dataInp.length;
        supplier[this.keySearch] = `${raw.substring(0, indexStart)}<strong>${raw.substring(indexStart, indexEnd)}</strong>${raw.substring(indexEnd)}`;
      }
    }
  }
  @Output() selectedRow = new EventEmitter<SupplierDTO>();
  @ViewChild('tableBody') tableBody: ElementRef;

  constructor() { }

  ngOnInit(): void {
    $(this.autocomplete).keydown((event: any) => {
      if (event.keyCode === 27) {
        this.isDisplay = false;
      }
      if (event.keyCode === 40 && this.indexSelect < this.listSupplier.length - 1) {
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
      if (this.listSupplier.length !== 0) {
        this.isDisplay = true;
      }
      return;
    }
    this.isDisplay = false;
  }

  selectRow(id) {
    this.indexSelect = 0;
    for (const e of this.sourceList) {
      if (e.id === id) {
        this.selectedRow.emit(e);
        return;
      }
    }
  }

}
