import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicalExaminationService {

  private medicalExamUrl = environment.apiUrl + '/medical-examination/';
  private diseaseUrl = environment.apiUrl + '/disease/';

  constructor(
    private http: HttpClient
  ) { }

  checkMedicalExamByPatientCode(patientCode: any) {
    const url = this.medicalExamUrl + 'check-medical-exam-exist-by-patient-code';
    const params = new HttpParams().set('patientCode', patientCode);
    return this.http.get(url, { params });
  }

  // checkMedicalExamByPhone(phone: any) {
  //   const url = this.medicalExamUrl + 'check-medical-exam-exist-by-phone';
  //   const params = new HttpParams().set('phone', phone);
  //   return this.http.get(url, { params });
  // }

  changeStatus(id: any, status: any) {
    const url = this.medicalExamUrl + 'change-status';
    const formData = new FormData();
    formData.append('id', id);
    formData.append('status', status);
    return this.http.put(url, formData);
  }

  changeDoctor(id: any, doctorId: any) {
    const url = this.medicalExamUrl + 'change-doctor';
    const formData = new FormData();
    formData.append('id', id);
    formData.append('doctorId', doctorId);
    return this.http.put(url, formData);
  }

  getMedicalExam(id: any) {
    const url = this.medicalExamUrl + 'get-medical-exam';
    const params = new HttpParams().set('id', id);
    return this.http.get(url, { params });
  }

  searchByDiseaseCode(icd10Code: string): any {
    const url = this.diseaseUrl + 'get-disease-by-code';
    const params = new HttpParams().set('icd10Code', icd10Code);
    return this.http.get(url, { params });
  }

  searchByDiseaseName(diseaseNameSearch: string): any {
    const url = this.diseaseUrl + 'get-disease-by-name';
    const params = new HttpParams().set('diseaseNameSearch', diseaseNameSearch);
    return this.http.get(url, { params });
  }

  saveMedicalExam(medicalExamId: any, patientCode: any, patientName: any, phone: any, dateOfBirth: any, gender: any, address: any,
                  debt: any, examinationReason: any, bloodVessel: any, bloodPressure: any, breathing: any, temperature: any,
                  height: any, weight: any, symptom: any, summary: any, mainDisease: any, mainDiseaseCode: any, extraDisease: any,
                  extraDiseaseCode: any) {
    const url = this.medicalExamUrl + 'update-medical-exam';
    const formData = new FormData();
    if (medicalExamId) {
      formData.append('medicalExamId', medicalExamId);
    }
    if (patientCode) {
      formData.append('patientCode', patientCode);
    }
    formData.append('patientName', patientName);
    formData.append('phone', phone);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('gender', gender);
    formData.append('address', address);
    formData.append('debt', debt);
    formData.append('examinationReason', examinationReason);
    formData.append('bloodVessel', bloodVessel);
    formData.append('bloodPressure', bloodPressure);
    formData.append('breathing', breathing);
    formData.append('temperature', temperature);
    formData.append('height', height);
    formData.append('weight', weight);
    formData.append('symptom', symptom);
    formData.append('summary', summary);
    formData.append('mainDisease', mainDisease);
    formData.append('mainDiseaseCode', mainDiseaseCode);
    formData.append('extraDisease', extraDisease);
    formData.append('extraDiseaseCode', extraDiseaseCode);

    return this.http.post(url, formData);
  }

  updateHtmlReport(id: any, htmlReport: any) {
    const url = this.medicalExamUrl + 'update-html-report';
    const formData = new FormData();
    formData.append('id', id);
    formData.append('htmlReport', htmlReport);
    return this.http.put(url, formData);
  }
}
