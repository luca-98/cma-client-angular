import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PatientService {

    private patientUrl = environment.apiUrl + '/patient/';

    constructor(
        private http: HttpClient
    ) { }

    getPatient(pageSize: any, pageIndex: any) {
        const url = this.patientUrl + 'get-all-patient';
        const params = new HttpParams().set('pageSize', pageSize)
            .set('pageIndex', pageIndex);
        return this.http.get(url, { params });
    }
    searchPatient(searchData: any, pageSize: any, pageIndex: any) {
        const url = this.patientUrl + 'search-patient';
        const params = new HttpParams()
            .set('pageSize', pageSize)
            .set('pageIndex', pageIndex)
            .set('patientNameSearch', searchData.patientNameSearch ? searchData.patientNameSearch : '')
            .set('addressSearch', searchData.addressSearch ? searchData.addressSearch : '')
            .set('gender', searchData.gender ? searchData.gender : '')
            .set('patientCode', searchData.patientCode ? searchData.patientCode : '')
            .set('phone', searchData.phone ? searchData.phone : '')
            .set('yearOfBirth', searchData.yearOfBirth ? searchData.yearOfBirth : '');
        return this.http.get(url, { params });
    }
    editPatient(patient: any) {
        const url = this.patientUrl + 'edit-patient-information';
        const formData = new FormData();
        formData.append('id', patient.id);
        formData.append('patientName', patient.patientName);
        formData.append('dateOfBirth', patient.dateOfBirth);
        formData.append('gender', patient.gender);
        formData.append('address', patient.address);
        formData.append('phone', patient.phone);
        return this.http.put(url, formData);
    }

    deletePatient(patientID: any) {
        const url = this.patientUrl + 'delete-patient';
        const formData = new FormData();
        formData.append('id', patientID);
        return this.http.put(url, formData);
    }

    uploadListPatient(file: File): Observable<HttpEvent<any>> {
        const url = this.patientUrl + 'import-excel';
        const formData: FormData = new FormData();
        formData.append('fileImport', file);
        const req = new HttpRequest('POST', url, formData, {
            reportProgress: true,
            responseType: 'json'
        });
        return this.http.request(req);
    }

    downloadListPatient() {
        const url = this.patientUrl + 'download/danhSachBenhNhan.xlsx';
        return this.http.get(url, { responseType: 'blob' });
    }

    downloadTemplate() {
        const url = this.patientUrl + 'download/template';
        return this.http.get(url, { responseType: 'blob' });
    }

    getHistory(id: any) {
        const url = this.patientUrl + 'get-history';
        const params = new HttpParams().set('id', id);
        return this.http.get(url, { params });
    }
}
