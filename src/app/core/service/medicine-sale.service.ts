import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MedicineSaleService {

    private medicineSaleUrl = environment.apiUrl + '/medicine-sale/';

    constructor(
        private http: HttpClient
    ) { }

    searchMedicineByName(patientNameSearch) {
        const url = this.medicineSaleUrl + 'auto-search-patient';
        const params = new HttpParams().set('patientNameSearch', patientNameSearch);
        return this.http.get(url, { params });
    }
    searchMedicineByStaff(staffNameSearch) {
        const url = this.medicineSaleUrl + 'auto-search-staff';
        const params = new HttpParams().set('staffNameSearch', staffNameSearch);
        return this.http.get(url, { params });
    }
    searchMedicineSale(searchData) {
        const url = this.medicineSaleUrl + 'search-medicine-sale';
        const params = new HttpParams()
            .set('patientCode', searchData.patientCode ? searchData.patientCode.trim() : '')
            .set('startDate', searchData.startDate ? searchData.startDate : '')
            .set('endDate', searchData.endDate ? searchData.endDate : '')
            .set('pageSize', searchData.pageSize)
            .set('pageIndex', searchData.pageIndex)
            .set('staffNameSearch', searchData.staffNameSearch ? searchData.staffNameSearch.trim() : '')
            .set('patientNameSearch', searchData.patientNameSearch ? searchData.patientNameSearch.trim() : '');
        return this.http.get(url, { params });
    }

    getAllMedicineSale(pageSize, pageIndex) {
        const url = this.medicineSaleUrl + 'get-all-medicine-sale';
        const params = new HttpParams()
            .set('pageSize', pageSize)
            .set('pageIndex', pageIndex);
        return this.http.get(url, { params });
    }
    autoSearchPatientCode(patientCode) {
        const url = this.medicineSaleUrl + 'auto-search-patient-code';
        const params = new HttpParams().set('patientCode', patientCode);
        return this.http.get(url, { params });
    }

    getListPrescriptionByPatientId(patientId) {
        const url = this.medicineSaleUrl + 'get-list-prescription-by-patientId';
        const params = new HttpParams().set('patientId', patientId);
        return this.http.get(url, { params });
    }

    getPrescriptionById(prescriptionId) {
        const url = this.medicineSaleUrl + 'get-prescription-by-id';
        const params = new HttpParams().set('prescriptionId', prescriptionId);
        return this.http.get(url, { params });
    }

    saveMedicineSale(dataPost) {
        const url = this.medicineSaleUrl + 'save-medicine-sale';
        return this.http.post(url, dataPost);
    }

    getAllByMedicineSaleId(medicineSaleId) {
        const url = this.medicineSaleUrl + 'get-all-medicine-sale-detail-by-medicine-saleId';
        const params = new HttpParams().set('medicineSaleId', medicineSaleId);
        return this.http.get(url, { params });
    }


}
