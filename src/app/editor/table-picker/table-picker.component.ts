import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-table-picker',
  templateUrl: './table-picker.component.html',
  styleUrls: ['./table-picker.component.scss']
})
export class TablePickerComponent implements OnInit {
  dropdownShowed = false;
  tablePickerHeader = 'Chèn bảng';
  arr = Array; // Array type captured in a variable
  totalItem = 0;
  rowGrid: number;
  colGrid: number;
  tablePickerGrid: any;
  @Output('select') selectEventEmitter = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    this.initElement();
  }

  initElement() {
    this.tablePickerGrid = document.getElementById('table-picker-grid');
  }

  showDropdown() {
    if (this.dropdownShowed) {
      this.dropdownShowed = false;
      return;
    }
    this.rowGrid = 5;
    this.colGrid = 5;

    this.totalItem = this.rowGrid * this.colGrid;

    this.tablePickerGrid.style.gridTemplateColumns = 'auto auto auto auto auto';
    this.dropdownShowed = true;
  }

  tablePickerGridItemMouseEnter(event: any) {
    const listItem = this.tablePickerGrid.getElementsByTagName('span');
    for (const span of listItem) {
      span.classList.remove('hover');
    }

    let indexSpan = 0;
    for (const span of listItem) {
      indexSpan++;
      if (event.target === span) {
        const indexRow = Math.ceil(indexSpan / this.colGrid);
        const indexCol = indexSpan - (this.colGrid * (indexRow - 1));
        this.tablePickerHeader = indexCol + ' x ' + indexRow;
        if (this.rowGrid === indexRow && indexRow < 15) {
          this.totalItem += this.colGrid;

          for (let i = 1; i <= indexRow; i++) {
            for (let j = 1; j <= indexCol; j++) {
              const index = this.colGrid * (i - 1) + j;
              listItem[index - 1].classList.add('hover');
            }
          }
          this.rowGrid++;
          return;
        }
        if (this.colGrid === indexCol && indexCol < 15) {
          let cssAtr = 'auto ';
          this.totalItem += this.rowGrid;
          for (let i = 0; i < this.colGrid; i++) {
            cssAtr += 'auto ';
          }
          this.tablePickerGrid.style.gridTemplateColumns = cssAtr;

          for (let i = 1; i <= indexRow; i++) {
            for (let j = 1; j <= indexCol; j++) {
              const index = this.colGrid * (i - 1) + j;
              listItem[index - 1].classList.add('hover');
            }
          }
          this.colGrid++;
          return;
        }

        for (let i = 1; i <= indexRow; i++) {
          for (let j = 1; j <= indexCol; j++) {
            const index = this.colGrid * (i - 1) + j;
            listItem[index - 1].classList.add('hover');
          }
        }
      }
    }
  }

  tablePickerGridMouseLeave() {
    const listItem = this.tablePickerGrid.getElementsByTagName('span');
    for (const span of listItem) {
      span.classList.remove('hover');
    }
    this.tablePickerHeader = 'Chèn bảng';
  }

  // hide toolbar dropdown when click outside it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target: any = event.target;
    const classTarget: string = target.getAttribute('class');
    if (
      classTarget === null ||
      (!classTarget.includes('insert-table') &&
        !classTarget.includes('icon-table-grid') &&
        !classTarget.includes('table-picker-grid'))
    ) {
      this.dropdownShowed = false;
    }
  }

  gridItemOnClick(event: any) {
    const listItem = this.tablePickerGrid.getElementsByTagName('span');
    let indexSpan = 0;
    for (const span of listItem) {
      indexSpan++;
      if (event.target === span) {
        const indexRow = Math.ceil(indexSpan / this.colGrid);
        const indexCol = indexSpan - (this.colGrid * (indexRow - 1));
        this.selectEventEmitter.emit({ col: indexCol, row: indexRow });
        return;
      }
    }
  }
}
