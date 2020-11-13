import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {
  currentItem: number;
  changeItemSubject: Subject<number> = new Subject();

  constructor() { }

  changeItem(value: number): void {
    this.currentItem = value;
    this.changeItemSubject.next(value);
  }

  getCurrentItem(): number {
    return this.currentItem;
  }
}
