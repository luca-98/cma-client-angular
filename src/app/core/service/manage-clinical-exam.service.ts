import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageClinicalExamService {

  private medicalExamUrl = environment.apiUrl + '/medical-examination/';

  constructor(
    private http: HttpClient
  ) { }

  getPatientReceive(fromDate: any, toDate: any, roomId: any, doctorId: any, status: any,
                    clinicalExamCode: any, patientCode: any, phone: any, pageIndex: any, pageSize: any) {
    const url = this.medicalExamUrl + 'get-list-medical-exam';
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('roomId', roomId)
      .set('doctorId', doctorId)
      .set('status', status)
      .set('clinicalExamCode', clinicalExamCode)
      .set('patientCode', patientCode)
      .set('phone', phone)
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);
    return this.http.get(url, { params });
  }

  getNextOrdinNumberRoom(roomId: any) {
    const url = this.medicalExamUrl + 'get-next-ordinal-room';
    const params = new HttpParams().set('roomId', roomId);
    return this.http.get(url, { params });
  }

  getNextOrdinNumberStaff(staffId: any) {
    const url = this.medicalExamUrl + 'get-next-ordinal-staff';
    const params = new HttpParams().set('staffId', staffId);
    return this.http.get(url, { params });
  }
}
