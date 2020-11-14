import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MedicineService {

    private medicineUrl = environment.apiUrl + '/medicine/';
    private prescriptionUrl = environment.apiUrl + '/prescription/';
    private prescriptionDetailUrl = environment.apiUrl + '/prescription-detail/';

    constructor(
        private http: HttpClient
    ) { }

    getAllMedicineByGroupMedicine(groupId) {
        const url = this.medicineUrl + 'get-medicine-by-group-id';
        const params = new HttpParams().set('groupId', groupId);
        return this.http.get(url, { params });
    }

    searchMedicineByName(name) {
        const url = this.medicineUrl + 'search-medicine-by-name';
        const params = new HttpParams().set('medicineName', name);
        return this.http.get(url, { params });
    }

    getPrescriptionByMedicalexamId(medicalExamId) {
        const url = this.prescriptionUrl + 'get-prescription-by-medicalexamId';
        const params = new HttpParams().set('medicalExamId', medicalExamId);
        return this.http.get(url, { params });
    }

    updatePrescription(postData) {
        const url = this.prescriptionUrl + 'update-prescription';
        return this.http.post(url, postData);
    }

    deletePrescription(prescriptionDetailId) {
        const url = this.prescriptionDetailUrl + 'delete-prescription';
        const params = new HttpParams().set('prescriptionDetailId', prescriptionDetailId);
        return this.http.delete(url, { params });
    }




}
