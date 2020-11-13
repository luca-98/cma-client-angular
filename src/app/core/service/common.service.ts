import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private patientUrl = environment.apiUrl + '/patient/';
  private roomServiceUrl = environment.apiUrl + '/room-service/';
  private staffUrl = environment.apiUrl + '/staff/';
  private medicalExamUrl = environment.apiUrl + '/medical-examination/';
  private serviceUrl = environment.apiUrl + '/service/';

  constructor(
    private http: HttpClient
  ) { }


  getAllDoctor(): any {
    const url = this.staffUrl + 'get-all-clinical-exam-staff';
    return this.http.get(url);
  }

  getRoomMedicalExam(): any {
    const url = this.roomServiceUrl + 'get-all-clinical-exam-room';
    return this.http.get(url);
  }

  searchByName(name: string): any {
    const url = this.patientUrl + 'search-by-name';
    const params = new HttpParams().set('name', name);
    return this.http.get(url, { params });
  }

  searchByPatientCode(patientCode: string): any {
    const url = this.patientUrl + 'search-by-code';
    const params = new HttpParams().set('patientCode', patientCode);
    return this.http.get(url, { params });
  }

  searchByPhone(phone: string): any {
    const url = this.patientUrl + 'search-by-phone';
    const params = new HttpParams().set('phone', phone);
    return this.http.get(url, { params });
  }

  searchByAddress(address: string): any {
    const url = this.patientUrl + 'search-auto-by-address';
    const params = new HttpParams().set('address', address);
    return this.http.get(url, { params });
  }

  getClinicalExamination(): any {
    const url = this.serviceUrl + 'get-price-clinical-examination';
    return this.http.get(url);
  }

  getServiceThatStaffCanDo(): any {
    const url = this.roomServiceUrl + 'get-list-room-with-staff-permission';
    return this.http.get(url);
  }

  updateRoomServiceStaff(roomId: any): any {
    const url = this.staffUrl + 'update-room-service-staff';
    const formData = new FormData();
    formData.append('roomId', roomId);
    return this.http.put(url, formData);
  }

  checkCanChangeRoom(): any {
    const url = this.staffUrl + 'check-staff-can-change-room';
    return this.http.get(url);
  }

  searchByMedicalExamCode(medicalExamCode: string): any {
    const url = this.medicalExamUrl + 'search-by-medical-exam-code';
    const params = new HttpParams().set('medicalExamCode', medicalExamCode);
    return this.http.get(url, { params });
  }

  findByPatientCode(patientCode: string): any {
    const url = this.patientUrl + 'find-by-patientCode';
    const params = new HttpParams().set('patientCode', patientCode);
    return this.http.get(url, { params });
  }

  findByPhone(phone: string): any {
    const url = this.patientUrl + 'find-by-phone';
    const params = new HttpParams().set('phone', phone);
    return this.http.get(url, { params });
  }

  editPatientInfor(id: any, patientName: any, dateOfBirth: any, gender: any, address: any, phone: any) {
    const url = this.patientUrl + 'edit-patient-information';
    const formData = new FormData();
    formData.append('id', id);
    formData.append('patientName', patientName);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('gender', gender);
    formData.append('address', address);
    formData.append('phone', phone);
    return this.http.put(url, formData);
  }
}
