import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubclinicalService {

  private subclinicalUrl = environment.apiUrl + '/subclinical/';
  private serviceReportUrl = environment.apiUrl + '/service-report/';
  private imageUrl = environment.apiUrl + '/image/';

  constructor(
    private http: HttpClient
  ) { }

  getStaffMinByService(groupServiceCode: any) {
    const url = this.subclinicalUrl + 'get-staff-min-service';
    const params = new HttpParams()
      .set('groupServiceCode', groupServiceCode);
    return this.http.get(url, { params });
  }

  getInitInfoAppoint(medicalExamId: any) {
    const url = this.subclinicalUrl + 'get-init-info-appoint';
    const params = new HttpParams()
      .set('medicalExamId', medicalExamId);
    return this.http.get(url, { params });
  }

  saveAppointSubclinical(object: any) {
    const url = this.subclinicalUrl + 'save-appoint-subclinical';
    return this.http.post(url, object);
  }

  getListForManage(fromDate: any, toDate: any, roomId: any, doctorId: any, status: any,
    // tslint:disable-next-line: align
    clinicalExamCode: any, patientCode: any, phone: any, pageIndex: any, pageSize: any) {
    const url = this.subclinicalUrl + 'get-list-for-manage';
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

  updateSubclinical(object: any) {
    const url = this.subclinicalUrl + 'update-subclinical';
    return this.http.post(url, object);
  }

  getListMedicalExamToday(patientCode) {
    const url = this.subclinicalUrl + 'get-list-medical-exam-today';
    const params = new HttpParams()
      .set('patientCode', patientCode);
    return this.http.get(url, { params });
  }
  initInfoSubclinical(medicalExamId) {
    const url = this.subclinicalUrl + 'init-info-subclinical';
    const params = new HttpParams()
      .set('medicalExamId', medicalExamId);
    return this.http.get(url, { params });
  }

  getStatusPayingSubclinical(medicalExamId) {
    const url = this.subclinicalUrl + 'get-status-paying-subclinical';
    const params = new HttpParams()
      .set('medicalExamId', medicalExamId);
    return this.http.get(url, { params });
  }

  changeStatus(id, status) {
    const url = this.serviceReportUrl + 'change-status';
    const params = new HttpParams()
      .set('id', id)
      .set('status', status);
    return this.http.get(url, { params });
  }

  uploadImage(serviceReportId: string, file: any) {
    const url = this.imageUrl;
    const formData = new FormData();
    formData.append('serviceReportId', serviceReportId);
    formData.append('file', file);
    return this.http.post(url, formData);
  }

  getAllImage(servicerReportId: string) {
    const url = this.imageUrl + 'get-by-service-report/' + servicerReportId;
    return this.http.get(url);
  }

  deleteImage(id: any) {
    const url = this.imageUrl + id;
    return this.http.delete(url);
  }
}
