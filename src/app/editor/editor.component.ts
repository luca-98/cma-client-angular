import { Component, OnInit, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { ForwardService } from './forward.service';

declare var $: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {
  editor: any;
  btnBoldActive = false;
  btnItalicActive = false;
  btnUnderlineActive = false;
  btnAlignLeftActive = true;
  btnAlignCenterActive = false;
  btnAlignRightActive = false;
  isMousemoveOnTable = false;
  isHighlight = false;
  firstPositionHighlight: any;
  lastPositionHighlight: any;
  disabledMergCell = true;
  execedCommand = false;

  listFonts = [
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Courier New', value: 'Courier New' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS' },
  ];
  selectedFont = 'Times New Roman';

  listFontsSize = [
    { name: '3', value: '3' },
    { name: '4', value: '4' },
    { name: '5', value: '5' },
    { name: '6', value: '6' },
    { name: '7', value: '7' },
  ];
  selectedFontSize = '4';

  tempContent: string;
  disabledUndo = true;
  disabledRedo = true;

  @ViewChild(ContextMenuComponent, { static: false }) contextMenu: ContextMenuComponent;

  constructor(
    private forwardService: ForwardService,
  ) { }

  ngOnInit() {
    this.forwardService.clear();
    this.initElement();
    this.initEditor();
  }

  ngOnDestroy(): void {
    this.forwardService.clear();
  }

  setContentEditor(content: string) {
    this.editor.innerHTML = content;
    this.setEventForAllTable();
    this.initTextArea();
    this.unFreezeInput();
  }

  unFreezeInput() {
    $('#editor input').each(function () {
      $(this).removeAttr('readonly');
      $(this).css('outline', '');
    });
  }

  freezeInput() {
    $('#editor input').each(function () {
      $(this).attr('value', $(this).val());
      $(this).prop('readonly', true);
      $(this).css('outline', 'none');
    });
  }

  initElement() {
    this.editor = document.getElementById('editor');
  }

  disableColResize() {
    const listTable: any = this.editor.getElementsByTagName('table');
    for (const table of listTable) {
      $(table).colResizable({
        disable: true
      });
    }
    $('.JCLRgrips').remove();
  }

  enableColResize() {
    const listTable: any = this.editor.getElementsByTagName('table');
    for (const table of listTable) {
      $(table).colResizable({
        liveDrag: true,
        draggingClass: 'dragging'
      });
    }
  }

  fixTdTag() {
    const listTd: any = this.editor.getElementsByTagName('td');
    for (const tdTag of listTd) {
      if (tdTag.innerHTML === '') {
        tdTag.innerHTML = '\u00A0';
      }
    }
  }

  changeWidth(value: any) {
    this.editor.style.width = value;
  }

  setAutoDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1);
    const day = String(today.getDate());
    const year = String(today.getFullYear());

    $('#day').html(day);
    $('#month').html(month);
    $('#year').html(year);
  }

  initTextArea() {
    $('#editor textarea').each(function () {
      const resizeTextarea = function (el: any) {
        $(el).css('height', 'auto').css('height', el.scrollHeight);
      };

      $(this).on('keyup input', function () {
        resizeTextarea(this);
      });
    });
  }

  saveUndoRedo() {
    const data = this.editor.innerHTML;
    this.forwardService.add(data);
    this.disabledUndo = false;
  }

  initEditor() {
    this.editor.innerHTML = '<style>.editor{padding:30px 61px;font-family:\'Times New Roman\',Times,serif;font-size:18px}</style>';
    this.editor.contentEditable = true;
    this.editor.spellcheck = false;
    // document.execCommand('fontSize', false, '4'); // set default font size is 4

    // remove table highlight when mouse down on editor
    this.editor.onmousedown = () => {
      if (!this.isHighlight) { return; }
      const listTable = document.getElementsByTagName('TABLE');
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < listTable.length; i++) {
        this.resetHighlight(listTable[i]);
      }
      this.disabledMergCell = true;
    };

    // detect style when click to item of editor
    this.editor.onmouseup = () => {
      this.detectStyle();
    };
    this.editor.onkeyup = () => {
      this.detectStyle();
    };

    // prevent drag and drop
    $(this.editor).bind('dragover drop', function (event: any) {
      event.preventDefault();
      return false;
    });

    // handle forward
    $(this.editor).keydown((event: any) => {
      // if user typing
      const keyCode = event.keyCode;
      // tslint:disable-next-line: triple-equals
      if (((event.ctrlKey || event.metaKey) && event.keyCode == 90)) {
        return;
      }
      if (
        (keyCode >= 48 && keyCode <= 57) ||
        (keyCode === 59) ||
        (keyCode === 61) ||
        (keyCode >= 65 && keyCode <= 90) ||
        (keyCode >= 96 && keyCode <= 107) ||
        (keyCode >= 109 && keyCode <= 111) ||
        (keyCode === 188) ||
        (keyCode >= 190 && keyCode <= 192) ||
        (keyCode === 219) ||
        (keyCode >= 220 && keyCode <= 222)
      ) {
        const data = this.editor.innerHTML;
        if (!this.tempContent) {
          this.tempContent = data;
          this.saveUndoRedo();
        }
        if (Math.abs(this.tempContent.length - data.length) > 5) {
          this.tempContent = data;
          this.saveUndoRedo();
        }
      }

      // if user press enter
      if (event.keyCode === 13) {
        this.saveUndoRedo();
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent) {
    // handle user press delete
    // tslint:disable-next-line: deprecation
    if ($event.keyCode == 46) {
      this.saveUndoRedo();
    }

    // handle user press backspace
    if ($event.keyCode == 8) {
      const data = this.editor.innerHTML;
      if (!this.tempContent) {
        this.tempContent = data;
        this.saveUndoRedo();
      }
      if (Math.abs(this.tempContent.length - data.length) > 5) {
        this.tempContent = data;
        this.saveUndoRedo();
      }
    }

    // handle Ctrl + V to custom undo redo
    if (($event.ctrlKey || $event.metaKey) && $event.keyCode == 86) {
      this.saveUndoRedo();
    }

    // handle Ctrl + Z to custom undo redo
    if (($event.ctrlKey || $event.metaKey) && $event.keyCode == 90) {
      $event.preventDefault();
      this.onUndo();
    }

    // handle Ctrl + Y to custom undo redo
    if (($event.ctrlKey || $event.metaKey) && $event.keyCode == 89) {
      $event.preventDefault();
      this.onRedo();
    }
  }

  // detect style to active button on toolbar
  detectStyle() {
    const caretNode = this.getCaretNode();
    this.activeButtonToolbar(caretNode, false, false, false, false, false, false);
  }

  activeButtonToolbar(node: any, isChangedFontStyle: boolean, isChangedFontSize: boolean,
    // tslint:disable-next-line: align
    isBold: boolean, isItalic: boolean, isUnderline: boolean, isAlign: boolean) {
    if (node === null) { return; }
    if (this.execedCommand) {
      this.execedCommand = false;
      return;
    }
    if (node === this.editor) {
      if (!isChangedFontStyle) { this.selectedFont = 'Times New Roman'; }
      if (!isChangedFontSize) { this.selectedFontSize = '4'; }
      if (!isBold) { this.btnBoldActive = false; }
      if (!isItalic) { this.btnItalicActive = false; }
      if (!isUnderline) { this.btnUnderlineActive = false; }
      if (!isAlign) {
        this.btnAlignLeftActive = true;
        this.btnAlignCenterActive = false;
        this.btnAlignRightActive = false;
      }
      return;
    }
    const nodeParent = node.parentNode;
    if (node.tagName === 'FONT') {
      if (!isChangedFontStyle) {
        const fontFamily = node.getAttribute('face');
        if (fontFamily !== null) {
          this.selectedFont = fontFamily;
          isChangedFontStyle = true;
        }
      }

      if (!isChangedFontSize) {
        const fontSize = node.getAttribute('size');
        if (fontSize !== null) {
          this.selectedFontSize = fontSize;
          isChangedFontSize = true;
        }
      }
    }
    if (node.tagName === 'B') {
      if (!isBold) {
        this.btnBoldActive = true;
        isBold = true;
      }
    }

    if (node.tagName === 'I') {
      if (!isItalic) {
        this.btnItalicActive = true;
        isItalic = true;
      }
    }

    if (node.tagName === 'U') {
      if (!isUnderline) {
        this.btnUnderlineActive = true;
        isUnderline = true;
      }
    }

    if (node.tagName === 'DIV' || node.tagName === 'TD') {
      if (!isAlign) {
        const align = node.style.textAlign;
        if (align === 'left') {
          this.btnAlignLeftActive = true;
          this.btnAlignCenterActive = false;
          this.btnAlignRightActive = false;
          isAlign = true;
        }
        if (align === 'center') {
          this.btnAlignLeftActive = false;
          this.btnAlignCenterActive = true;
          this.btnAlignRightActive = false;
          isAlign = true;
        }
        if (align === 'right') {
          this.btnAlignLeftActive = false;
          this.btnAlignCenterActive = false;
          this.btnAlignRightActive = true;
          isAlign = true;
        }
      }
    }

    this.activeButtonToolbar(nodeParent, isChangedFontStyle, isChangedFontSize,
      isBold, isItalic, isUnderline, isAlign);
  }

  // stop highlight when mouse up on document
  @HostListener('document:mouseup')
  onDocumentMouseUp() {
    this.isMousemoveOnTable = false;
  }

  // event function
  onFontChange(event: any) {
    this.saveUndoRedo();
    const value = event.target.value;
    document.execCommand('fontName', false, value);
    this.execedCommand = true;
  }

  onFontSizeChange(event: any) {
    this.saveUndoRedo();
    const value = event.target.value;
    document.execCommand('fontSize', false, value);
    this.execedCommand = true;
  }

  onBold() {
    this.saveUndoRedo();
    document.execCommand('bold', false, null);
    this.btnBoldActive = !this.btnBoldActive;
    this.execedCommand = true;
  }

  onItalic() {
    this.saveUndoRedo();
    document.execCommand('italic', false, null);
    this.btnItalicActive = !this.btnItalicActive;
    this.execedCommand = true;
  }

  onUnderline() {
    this.saveUndoRedo();
    document.execCommand('underline', false, null);
    this.btnUnderlineActive = !this.btnUnderlineActive;
    this.execedCommand = true;
  }

  onAlignLeft() {
    this.saveUndoRedo();
    document.execCommand('justifyLeft', false, null);
    this.btnAlignLeftActive = true;
    this.btnAlignCenterActive = false;
    this.btnAlignRightActive = false;
    this.execedCommand = true;
  }

  onAlignCenter() {
    this.saveUndoRedo();
    document.execCommand('justifyCenter', false, null);
    this.btnAlignLeftActive = false;
    this.btnAlignCenterActive = true;
    this.btnAlignRightActive = false;
    this.execedCommand = true;
  }

  onAlignRight() {
    this.saveUndoRedo();
    document.execCommand('justifyRight', false, null);
    this.btnAlignLeftActive = false;
    this.btnAlignCenterActive = false;
    this.btnAlignRightActive = true;
    this.execedCommand = true;
  }

  pickedLineSpacing(event: number) {
    this.saveUndoRedo();
    const childNodes = this.editor.childNodes;
    for (const node of childNodes) {
      if (node.style === undefined) { continue; }
      node.style.lineHeight = event;
    }
    this.execedCommand = true;
  }

  getCaretNode() {
    let selection: any;
    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.getSelection() && document.getSelection().type !== 'Control') {
      selection = document.getSelection();
    }
    let anchorNode = selection.anchorNode;
    if (anchorNode === null) {
      return null;
    }
    if (anchorNode.nodeType === 3) {
      anchorNode = anchorNode.parentNode;
    }
    return anchorNode;
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
    let table = trNode.parentNode;
    while (true) {
      if (table.nodeName === 'TABLE') { break; }
      table = table.parentNode;
    }
    const listTr = table.getElementsByTagName('TR');
    for (const tempTr of listTr) {
      if (trNode === tempTr) { break; }
      row++;
    }
    return {
      col,
      row,
      colspan,
      rowspan,
      table
    };
  }

  resetHighlight(table: any) {
    this.isHighlight = false;
    table.classList.remove('highlighted');
    const listTd = table.getElementsByTagName('TD');
    for (const td of listTd) {
      td.style.backgroundColor = null;
      td.classList.remove('cell-highlighted');
    }
  }

  // detect disable merge cell button when highlight table
  detectToDisableMergeCell(table: any, firstCol: number, lastCol: number, firstRow: number, lastRow: number) {
    const totalCellShouldHighlight = (lastCol - firstCol + 1) * (lastRow - firstRow + 1);
    const listCellHighlighted = table.getElementsByClassName('cell-highlighted');
    let totalCellHighlighted = listCellHighlighted.length;
    for (const cell of listCellHighlighted) {
      let colspan = cell.getAttribute('colspan');
      let rowspan = cell.getAttribute('rowspan');
      if (colspan === null && rowspan === null) {
        continue;
      }
      colspan = colspan === null ? 1 : Number(colspan);
      rowspan = rowspan === null ? 1 : Number(rowspan);
      totalCellHighlighted += colspan * rowspan;
      totalCellHighlighted--;
    }
    return totalCellShouldHighlight !== totalCellHighlighted;
  }

  setEventForCell(cell: any) {
    cell.onmousedown = () => {
      this.firstPositionHighlight = this.detectPositionCell(cell);
      this.lastPositionHighlight = this.firstPositionHighlight;
      this.isMousemoveOnTable = true;
    };

    cell.onmousemove = () => {
      if (!this.isMousemoveOnTable) { return; }
      const currentPosition = this.detectPositionCell(cell);
      if (JSON.stringify(currentPosition) !== JSON.stringify(this.lastPositionHighlight)
        && currentPosition.table === this.lastPositionHighlight.table) {
        this.disabledMergCell = false;
        this.lastPositionHighlight = currentPosition;

        // detect area to highlight
        let firstCol: number;
        let firstRow: number;
        let lastCol: number;
        let lastRow: number;
        let temp: number[];
        temp = [
          this.firstPositionHighlight.col,
          this.firstPositionHighlight.col + this.firstPositionHighlight.colspan - 1,
          this.lastPositionHighlight.col,
          this.lastPositionHighlight.col + this.lastPositionHighlight.colspan - 1
        ];
        firstCol = Math.min(...temp);
        lastCol = Math.max(...temp);
        temp = [
          this.firstPositionHighlight.row,
          this.firstPositionHighlight.row + this.firstPositionHighlight.rowspan - 1,
          this.lastPositionHighlight.row,
          this.lastPositionHighlight.row + this.lastPositionHighlight.rowspan - 1
        ];
        firstRow = Math.min(...temp);
        lastRow = Math.max(...temp);

        // find table of cell
        let table = cell.parentNode;
        while (true) {
          if (table.nodeName === 'TABLE') { break; }
          table = table.parentNode;
        }

        this.resetHighlight(table);

        // highlight table
        this.isHighlight = true;
        table.classList.add('highlighted');
        const listTr = table.getElementsByTagName('TR');
        for (let i = firstRow; i <= lastRow; i++) {
          const listTd = listTr[i].getElementsByTagName('TD');
          for (let j = firstCol; j <= lastCol; j++) {
            const tdTag = listTd[j - 1];
            if ($(tdTag).is(':hidden')) {
              continue; // no highlight cell merged
            }
            tdTag.style.backgroundColor = '#b4d7ff';
            tdTag.classList.add('cell-highlighted');
          }
        }
        // disable caret on highlight
        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        } else if (document.getSelection) {
          document.getSelection().empty();
        }

        if (this.detectToDisableMergeCell(table, firstCol, lastCol, firstRow, lastRow)) {
          this.disabledMergCell = true;
        }
      }
    };

    cell.oncontextmenu = (event: any) => {
      event.preventDefault();
      const menuPosition = {
        positionX: event.clientX,
        positionY: event.clientY
      };
      this.contextMenu.openMenuContext(cell, menuPosition);
    };
  }

  setEventForTable(table: any) {
    $(table).colResizable({
      disable: true
    });

    $(table).colResizable({
      liveDrag: true,
      draggingClass: 'dragging'
    });

    const listTdTag = table.getElementsByTagName('TD');
    for (const td of listTdTag) {
      this.setEventForCell(td);
    }
  }

  setEventForAllTable() {
    const listTable: any = this.editor.getElementsByTagName('TABLE');
    for (const table of listTable) {
      this.setEventForTable(table);
    }
  }

  pickedTable(event: any) {
    this.saveUndoRedo();
    let currentCaretNode = this.getCaretNode();

    // return if user choose input outside editor area or in another table
    if (currentCaretNode === null) {
      currentCaretNode = this.editor;
    } else {
      let temp = currentCaretNode;
      while (true) {
        if (temp === this.editor) { break; }
        if (temp.tagName === 'TABLE') { return; }
        if (temp === document) { return; }
        temp = temp.parentNode;
      }
    }

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px dotted #000';
    table.style.width = '100%';
    table.style.tableLayout = 'fixed';

    const tableBody = document.createElement('tbody');

    const tableHeader = document.createElement('tr');
    tableHeader.style.visibility = 'hidden';
    tableHeader.style.lineHeight = '1px';
    for (let i = 0; i < event.col; i++) {
      const th = document.createElement('th');
      tableHeader.appendChild(th);
    }
    tableBody.appendChild(tableHeader);

    for (let i = 0; i < event.row; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < event.col; j++) {
        const td = document.createElement('td');
        td.style.borderCollapse = 'collapse';
        td.style.border = '1px dotted #000';
        td.style.wordWrap = 'break-word';
        td.style.padding = '0 6px';
        tr.appendChild(td);
      }
      tableBody.appendChild(tr);
    }
    table.appendChild(tableBody);

    currentCaretNode.appendChild(table);

    // break line
    const divTag = document.createElement('div');
    const brTag = document.createElement('br');
    divTag.appendChild(brTag);
    currentCaretNode.appendChild(divTag);

    this.setEventForTable(table);
  }

  mergeCell() {
    this.saveUndoRedo();
    this.disabledMergCell = true;

    // detect area highlighted
    let firstCol: number;
    let firstRow: number;
    let lastCol: number;
    let lastRow: number;
    let temp: number[];
    temp = [
      this.firstPositionHighlight.col,
      this.firstPositionHighlight.col + this.firstPositionHighlight.colspan - 1,
      this.lastPositionHighlight.col,
      this.lastPositionHighlight.col + this.lastPositionHighlight.colspan - 1
    ];
    firstCol = Math.min(...temp);
    lastCol = Math.max(...temp);
    temp = [
      this.firstPositionHighlight.row,
      this.firstPositionHighlight.row + this.firstPositionHighlight.rowspan - 1,
      this.lastPositionHighlight.row,
      this.lastPositionHighlight.row + this.lastPositionHighlight.rowspan - 1
    ];
    firstRow = Math.min(...temp);
    lastRow = Math.max(...temp);

    // get table highlighted
    const tableHighlighted = document.getElementsByClassName('highlighted')[0];
    const listTrTag = tableHighlighted.getElementsByTagName('TR');
    let isCellFirst = true;
    for (let i = firstRow; i <= lastRow; i++) {
      const listTdTag = listTrTag[i].getElementsByTagName('TD');
      if (isCellFirst) {
        for (let j = firstCol - 1; j < lastCol; j++) {
          const td: any = listTdTag[j];
          if (isCellFirst) {
            isCellFirst = false;

            // reset highlight
            this.resetHighlight(tableHighlighted);
            td.style.backgroundColor = '#b4d7ff';
            this.isHighlight = true;

            const colspan = lastCol - firstCol + 1;
            const rowspan = lastRow - firstRow + 1;

            listTdTag[j].setAttribute('colspan', String(colspan));
            listTdTag[j].setAttribute('rowspan', String(rowspan));
            continue;
          }
          td.innerHTML = '';
          td.removeAttribute('class');
          td.removeAttribute('style');
          td.removeAttribute('colspan');
          td.removeAttribute('rowspan');
          td.hidden = true;
        }
        continue;
      }
      for (let j = firstCol - 1; j < lastCol; j++) {
        const td: any = listTdTag[j];
        td.innerHTML = '';
        td.removeAttribute('class');
        td.removeAttribute('style');
        td.removeAttribute('colspan');
        td.removeAttribute('rowspan');
        td.hidden = true;
      }
    }
  }

  afterTableChange(table: any) {
    this.setEventForTable(table);
  }

  beforeTableChange() {
    this.saveUndoRedo();
  }

  onUndo() {
    const oldData = this.editor.innerHTML;
    const obj = this.forwardService.undoData(oldData);
    if (obj) {
      const data = obj.data;
      if (data !== null && data !== undefined) {
        this.editor.innerHTML = data;
        this.setEventForAllTable();
      }
      this.disabledUndo = obj.disableUndo;
      this.disabledRedo = false;
    }
  }

  onRedo() {
    const obj = this.forwardService.redoData();
    if (obj) {
      const data = obj.data;
      if (data !== null && data !== undefined) {
        this.editor.innerHTML = data;
        this.setEventForAllTable();
      }
      this.disabledRedo = obj.disableRedo;
      this.disabledUndo = false;
    }
  }
}
