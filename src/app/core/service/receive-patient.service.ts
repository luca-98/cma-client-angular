import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReceivePatientService {

  private patientUrl = environment.apiUrl + '/patient/';
  private ordinalUrl = environment.apiUrl + '/ordinal-number/';
  private receivePatientUrl = environment.apiUrl + '/receive-patient/';

  constructor(
    private http: HttpClient
  ) { }

  getOrdinalNumber(roomId: any): any {
    const url = this.ordinalUrl + 'get-ordinal-number';
    const params = new HttpParams().set('roomServiceId', roomId);
    return this.http.get(url, { params });
  }

  receivePatient(patientCode: any, patientName: any, phone: any, dateOfBirth: any, gender: any, address: any,
    ordinalNumber: any, clinicalExamPrice: any, roomServiceId: any, staffId: any, debt: any, examinationReason: any,
    appointmentId?: any): any {
    const url = this.receivePatientUrl + 'add-patient-receive';

    const formData = new FormData();
    if (patientCode !== '') {
      formData.append('patientCode', patientCode);
    }
    formData.append('patientName', patientName);
    formData.append('phone', phone);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('gender', gender);
    formData.append('address', address);
    formData.append('ordinalNumber', ordinalNumber);
    formData.append('clinicalExamPrice', clinicalExamPrice);
    formData.append('roomServiceId', roomServiceId);
    formData.append('staffId', staffId);
    formData.append('debt', debt);
    formData.append('examinationReason', examinationReason);
    if (appointmentId !== null && appointmentId !== undefined) {
      formData.append('appointmentId', appointmentId);
    }

    return this.http.post(url, formData);
  }

  updateReceivePatient(receiveId: any, patientCode: any, patientName: any, phone: any, dateOfBirth: any, gender: any, address: any,
    ordinalNumber: any, clinicalExamPrice: any, roomServiceId: any, staffId: any, debt: any,
    examinationReason: any): any {
    const url = this.receivePatientUrl + 'update-receive';

    const formData = new FormData();
    formData.append('receiveId', receiveId);
    formData.append('patientCode', patientCode);
    formData.append('patientName', patientName);
    formData.append('phone', phone);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('gender', gender);
    formData.append('address', address);
    formData.append('ordinalNumber', ordinalNumber);
    formData.append('clinicalExamPrice', clinicalExamPrice);
    formData.append('roomServiceId', roomServiceId);
    formData.append('staffId', staffId);
    formData.append('debt', debt);
    formData.append('examinationReason', examinationReason);

    return this.http.put(url, formData);
  }

  getPatientReceive(pageSize: any, pageIndex: any) {
    const url = this.receivePatientUrl + 'get-patient-receive';
    const params = new HttpParams().set('pageSize', pageSize)
      .set('pageIndex', pageIndex);
    return this.http.get(url, { params });
  }

  cancelReceive(id: any) {
    const url = this.receivePatientUrl + 'cancel-receive';
    const formData = new FormData();
    formData.append('id', id);
    return this.http.put(url, formData);
  }

  checkReceive(patientCode: any, phone: any) {
    const url = this.receivePatientUrl + 'check-is-receive';
    let params = new HttpParams();
    const formData = new FormData();
    if (patientCode) {
      params = params.set('patientCode', patientCode);
    }
    if (phone) {
      params = params.set('phone', phone);
    }
    return this.http.get(url, { params });
  }

  getById(id: string): any {
    const url = this.patientUrl + 'get-by-id';
    const params = new HttpParams().set('id', id);
    return this.http.get(url, { params });
  }
}
