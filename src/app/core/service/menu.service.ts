import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  reloadMenu: Subject<any> = new Subject();

  constructor() { }

  reload(): void {
    this.reloadMenu.next();
  }
}
