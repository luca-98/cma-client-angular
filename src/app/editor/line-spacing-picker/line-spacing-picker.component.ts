import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';

interface lineSpacingPickerValue {
  value: number;
  checked: boolean;
}

@Component({
  selector: 'app-line-spacing-picker',
  templateUrl: './line-spacing-picker.component.html',
  styleUrls: ['./line-spacing-picker.component.scss']
})
export class LineSpacingPickerComponent implements OnInit {
  lineSpacingPickerShow = false;
  lineSpacingPickerValues: lineSpacingPickerValue[] = new Array();
  @Output('select') selectEventEmitter = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
    this.initValue();
  }

  initValue() {
    this.lineSpacingPickerValues.push({ value: 0.8, checked: false });
    this.lineSpacingPickerValues.push({ value: 0.9, checked: false });
    this.lineSpacingPickerValues.push({ value: 1.0, checked: true });
    this.lineSpacingPickerValues.push({ value: 1.1, checked: false });
    this.lineSpacingPickerValues.push({ value: 1.2, checked: false });
    this.lineSpacingPickerValues.push({ value: 1.3, checked: false });
    this.lineSpacingPickerValues.push({ value: 1.4, checked: false });
    this.lineSpacingPickerValues.push({ value: 1.5, checked: false });
    this.lineSpacingPickerValues.push({ value: 1.6, checked: false });
    this.lineSpacingPickerValues.push({ value: 1.7, checked: false });
    this.lineSpacingPickerValues.push({ value: 1.8, checked: false });
    this.lineSpacingPickerValues.push({ value: 1.9, checked: false });
    this.lineSpacingPickerValues.push({ value: 2.0, checked: false });
  }

  showDropdown() {
    this.lineSpacingPickerShow = !this.lineSpacingPickerShow;
  }

  // hide toolbar dropdown when click outside it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target: any = event.target;
    const classTarget: string = target.getAttribute('class');
    if (
      classTarget === null ||
      (!classTarget.includes('btn-line-spacing') &&
        !classTarget.includes('icon-line-spacing'))
    ) {
      this.lineSpacingPickerShow = false;
    }
  }

  onPick(event: any) {
    let target: any;
    if (event.target.tagName === 'I') {
      return;
    } else if (event.target.tagName === 'SPAN') {
      target = event.target.parentNode;
    } else {
      target = event.target;
    }
    const index = target.getAttribute('value');
    if (!this.lineSpacingPickerValues[index].checked) {
      for (const item of this.lineSpacingPickerValues) {
        item.checked = false;
      }
      this.lineSpacingPickerValues[index].checked = true;
      this.selectEventEmitter.emit(this.lineSpacingPickerValues[index].value);
    }
  }
}
