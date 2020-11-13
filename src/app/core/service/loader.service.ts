import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  loaderSubject: Subject<boolean> = new Subject();

  constructor() { }

  changeLoaderState(value: boolean): void {
    this.loaderSubject.next(value);
  }
}
