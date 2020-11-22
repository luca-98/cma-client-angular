import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {

    private invoiceUrl = environment.apiUrl + '/invoice/';

    constructor(
        private http: HttpClient
    ) { }


    searchByName(name: any) {
        const url = this.invoiceUrl + 'search-by-name';
        const params = new HttpParams().set('name', name);
        return this.http.get(url, { params });
    }
    searchByCode(patientCode: any) {
        const url = this.invoiceUrl + 'search-by-code';
        const params = new HttpParams().set('patientCode', patientCode);
        return this.http.get(url, { params });
    }
    searchByPhone(phone: any) {
        const url = this.invoiceUrl + 'search-by-phone';
        const params = new HttpParams().set('phone', phone);
        return this.http.get(url, { params });
    }

    getInvoiceByPatientId(patientId) {
        const url = this.invoiceUrl + 'get-invoice-by-patientId';
        const params = new HttpParams().set('patientId', patientId);
        return this.http.get(url, { params });
    }

    updateInvoice(data) {
        const url = this.invoiceUrl + 'update-invoice';
        return this.http.post(url, data);
    }


}
