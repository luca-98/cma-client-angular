import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

const forwardKey = 'cma_forward';
const totalStep = 100;
let currentStep = 0;

@Injectable({
  providedIn: 'root'
})
export class ForwardService {
  saveSubject: Subject<any> = new Subject();

  constructor() { }

  add(data: string) {
    this.saveSubject.next();
    const dataInMemory = localStorage.getItem(forwardKey);
    if (dataInMemory === null) {
      const newData = [data];
      localStorage.setItem(forwardKey, JSON.stringify(newData));
    } else {
      const obj = JSON.parse(dataInMemory);
      if (currentStep === totalStep) {
        obj.shift();
      }
      for (let i = currentStep; i < obj.length - 1; i++) {
        obj.pop();
      }
      obj.push(data);
      currentStep++;
      localStorage.setItem(forwardKey, JSON.stringify(obj));
    }
  }

  undoData(oldData: string) {
    const dataInMemory = localStorage.getItem(forwardKey);
    if (dataInMemory !== null) {
      let disableUndo = false;
      const obj = JSON.parse(dataInMemory);
      if (currentStep === obj.length - 1) {
        obj.push(oldData);
      }
      const ret = obj[currentStep];
      if (currentStep > 0) {
        currentStep--;
      } else {
        disableUndo = true;
      }
      localStorage.setItem(forwardKey, JSON.stringify(obj));
      return {
        disableUndo,
        data: ret
      };
    }
  }

  redoData() {
    const dataInMemory = localStorage.getItem(forwardKey);
    if (dataInMemory !== null) {
      let disableRedo = false;
      const obj = JSON.parse(dataInMemory);
      if (currentStep < totalStep) {
        currentStep++;
      }
      const ret = obj[currentStep];
      if (currentStep === obj.length - 1) {
        disableRedo = true;
      }
      return {
        disableRedo,
        data: ret
      };
    }
  }

  clear() {
    localStorage.removeItem(forwardKey);
  }
}
