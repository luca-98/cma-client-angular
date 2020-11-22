import { Component, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

declare var $: any;

export interface MenuPosition {
  positionX: number;
  positionY: number;
}

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {
  menuPosition: MenuPosition;
  @ViewChild(MatMenuTrigger, { static: false }) contextMenu: MatMenuTrigger;
  @Output('afterTableChange') afterTableChange = new EventEmitter<any>();
  @Output('beforeTableChange') beforeTableChange = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    this.menuPosition = {
      positionX: 0,
      positionY: 0
    };
  }

  openMenuContext(cell: any, menuPosition: MenuPosition) {
    this.menuPosition = menuPosition;
    this.contextMenu.menuData = { cell: cell };
    this.contextMenu.openMenu();
  }

  findTableOfCell(cell: any) {
    let table = cell.parentNode;
    while (true) {
      if (table.nodeName === 'TABLE') { break; }
      table = table.parentNode;
    }
    return table;
  }

  deleteTable(cell: any) {
    this.beforeTableChange.emit();
    const table = this.findTableOfCell(cell);

    $(table).colResizable({
      disable: true
    });
    table.parentNode.removeChild(table);
  }

  detectPositionCell(cell: any) {
    let col = 0;
    let row = 0;
    let colspan = cell.getAttribute('colspan');
    let rowspan = cell.getAttribute('rowspan');
    colspan = colspan === null ? 1 : Number(colspan);
    rowspan = rowspan === null ? 1 : Number(rowspan);

    // detect column of cell
    let trNode = cell.parentNode;
    while (true) {
      if (trNode.nodeName === 'TR') { break; }
      trNode = trNode.parentNode;
    }
    const listTd = trNode.getElementsByTagName('TD');
    for (const td of listTd) {
      col++;
      if (cell === td) { break; }
    }

    // detect row of cell
    let tBody = trNode.parentNode;
    while (true) {
      if (tBody.nodeName === 'TBODY') { break; }
      tBody = tBody.parentNode;
    }
    const listTr = tBody.getElementsByTagName('TR');
    for (const tempTr of listTr) {
      if (trNode === tempTr) { break; }
      row++;
    }
    return {
      col,
      row,
      colspan,
      rowspan
    };
  }

  insertColumnLeft(cell: any) {
    this.beforeTableChange.emit();
    const positionCell = this.detectPositionCell(cell);
    const table = this.findTableOfCell(cell);
    const listTrTag = table.getElementsByTagName('TR');
    for (let i = 0; i < listTrTag.length; i++) {
      if (i === 0) {
        const listThTag = listTrTag[0].getElementsByTagName('TH');
        const th = listThTag[positionCell.col - 1];
        const currentWidth = th.style.width;
        const newWidth = Number(currentWidth.substring(0, currentWidth.length - 2)) - 22;
        th.style.width = newWidth + 'px';
        const newCell = document.createElement('th');
        newCell.style.width = '20px';
        listTrTag[0].insertBefore(newCell, listThTag[positionCell.col - 1]);
        continue;
      }
      const listTdTag = listTrTag[i].getElementsByTagName('TD');
      const newCell = document.createElement('td');
      newCell.style.borderCollapse = 'collapse';
      newCell.style.border = '1px dotted #000';
      newCell.style.wordWrap = 'break-word';
      newCell.style.padding = '0 6px';
      listTrTag[i].insertBefore(newCell, listTdTag[positionCell.col - 1]);
    }
    this.afterTableChange.emit(table);
  }

  insertColumnRight(cell: any) {
    this.beforeTableChange.emit();
    const positionCell = this.detectPositionCell(cell);
    const table = this.findTableOfCell(cell);
    const listTrTag = table.getElementsByTagName('TR');
    for (let i = 0; i < listTrTag.length; i++) {
      if (i === 0) {
        const listThTag = listTrTag[0].getElementsByTagName('TH');
        let th = listThTag[positionCell.col + positionCell.colspan - 1];
        if (!th) {
          th = listThTag[positionCell.col + positionCell.colspan - 3];
        }
        const currentWidth = th.style.width;
        const newWidth = Number(currentWidth.substring(0, currentWidth.length - 2)) - 22;
        th.style.width = newWidth + 'px';
        const newCell = document.createElement('th');
        newCell.style.width = '20px';
        listTrTag[0].insertBefore(newCell, listThTag[positionCell.col + positionCell.colspan - 1]);
        continue;
      }
      const listTdTag = listTrTag[i].getElementsByTagName('TD');
      const newCell = document.createElement('td');
      newCell.style.borderCollapse = 'collapse';
      newCell.style.border = '1px dotted #000';
      newCell.style.wordWrap = 'break-word';
      newCell.style.padding = '0 6px';
      listTrTag[i].insertBefore(newCell, listTdTag[positionCell.col + positionCell.colspan - 1]);
    }
    this.afterTableChange.emit(table);
  }

  deleteColumn(cell: any) {
    this.beforeTableChange.emit();
    const positionCell = this.detectPositionCell(cell);
    const table = this.findTableOfCell(cell);
    for (let i = 0; i < positionCell.colspan; i++) {
      const listTrTag = table.getElementsByTagName('TR');
      for (let i = 0; i < listTrTag.length; i++) {
        if (i === 0) {
          const listThTag = listTrTag[0].getElementsByTagName('TH');
          const thDelete = listThTag[positionCell.col - 1];
          const thDeleteWidth = thDelete.style.width;
          const deleteWidth = Number(thDeleteWidth.substring(0, thDeleteWidth.length - 2));

          const thBefore = listThTag[positionCell.col - 2];
          const thBeforeWidth = thBefore.style.width;
          const currentWidth = Number(thBeforeWidth.substring(0, thBeforeWidth.length - 2));
          const newWidth = currentWidth + deleteWidth + 1;
          thBefore.style.width = newWidth + 'px';

          listTrTag[0].removeChild(thDelete);
          continue;
        }
        const listTdTag = listTrTag[i].getElementsByTagName('TD');
        listTrTag[i].removeChild(listTdTag[positionCell.col - 1]);
      }
    }
    this.afterTableChange.emit(table);
  }

  insertRowAbove(cell: any) {
    this.beforeTableChange.emit();
    const positionCell = this.detectPositionCell(cell);
    const table = this.findTableOfCell(cell);
    const tBody = table.getElementsByTagName('TBODY')[0];
    const listTrTag = table.getElementsByTagName('TR');
    const totalCol = listTrTag[0].getElementsByTagName('TH').length;
    const tr = document.createElement('tr');
    for (let i = 0; i < totalCol; i++) {
      const newCell = document.createElement('td');
      newCell.style.borderCollapse = 'collapse';
      newCell.style.border = '1px dotted #000';
      newCell.style.wordWrap = 'break-word';
      newCell.style.padding = '0 6px';
      tr.appendChild(newCell);
    }
    tBody.insertBefore(tr, listTrTag[positionCell.row]);
    this.afterTableChange.emit(table);
  }

  insertRowBelow(cell: any) {
    this.beforeTableChange.emit();
    const positionCell = this.detectPositionCell(cell);
    const table = this.findTableOfCell(cell);
    const tBody = table.getElementsByTagName('TBODY')[0];
    const listTrTag = table.getElementsByTagName('TR');
    const totalCol = listTrTag[0].getElementsByTagName('TH').length;
    const tr = document.createElement('tr');
    for (let i = 0; i < totalCol; i++) {
      const newCell = document.createElement('td');
      newCell.style.borderCollapse = 'collapse';
      newCell.style.border = '1px dotted #000';
      newCell.style.wordWrap = 'break-word';
      newCell.style.padding = '0 6px';
      tr.appendChild(newCell);
    }
    tBody.insertBefore(tr, listTrTag[positionCell.row + positionCell.rowspan]);
    this.afterTableChange.emit(table);
  }

  deleteRow(cell: any) {
    this.beforeTableChange.emit();
    const positionCell = this.detectPositionCell(cell);
    const table = this.findTableOfCell(cell);
    const tBody = table.getElementsByTagName('TBODY')[0];
    for (let i = 0; i < positionCell.rowspan; i++) {
      const listTrTag = table.getElementsByTagName('TR');
      const rowDelete = listTrTag[positionCell.row];
      tBody.removeChild(rowDelete);
    }
    this.afterTableChange.emit(table);
  }

  hideBorder(cell: any) {
    this.beforeTableChange.emit();
    const table = this.findTableOfCell(cell);
    table.style.border = 'none';
    const listTd = table.getElementsByTagName('TD');
    for (const td of listTd) {
      td.style.border = 'none';
    }
  }

  showBorder(cell: any) {
    this.beforeTableChange.emit();
    const table = this.findTableOfCell(cell);
    table.style.border = '1px dotted #000';
    const listTd = table.getElementsByTagName('TD');
    for (const td of listTd) {
      td.style.border = '1px dotted #000';
    }
  }
}
