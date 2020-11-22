import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {

    private supplierUrl = environment.apiUrl + '/supplier/';
    private groupMaterialUrl = environment.apiUrl + '/group-material/';
    private receiptUrl = environment.apiUrl + '/receipt/';
    constructor(
        private http: HttpClient
    ) { }

    searchByReceiptName(text) {
        const url = this.receiptUrl + 'auto-search-receipt-name';
        const params = new HttpParams()
            .set('receiptName', text);
        return this.http.get(url, { params });
    }

    searchByName(supplierName) {
        const url = this.supplierUrl + 'search-by-name';
        const params = new HttpParams()
            .set('supplierName', supplierName);
        return this.http.get(url, { params });
    }

    searchByEmail(email) {
        const url = this.supplierUrl + 'search-by-email';
        const params = new HttpParams()
            .set('email', email);
        return this.http.get(url, { params });
    }

    searchByPhone(phone) {
        const url = this.supplierUrl + 'search-by-phone';
        const params = new HttpParams()
            .set('phone', phone);
        return this.http.get(url, { params });
    }

    searchByAddess(address) {
        const url = this.supplierUrl + 'search-by-address';
        const params = new HttpParams()
            .set('address', address);
        return this.http.get(url, { params });
    }

    searchByAccountNumber(accountNumber) {
        const url = this.supplierUrl + 'search-by-account-number';
        const params = new HttpParams()
            .set('accountNumber', accountNumber);
        return this.http.get(url, { params });
    }

    getAllGroupMaterial() {
        const url = this.groupMaterialUrl + 'get-all-group-material';
        return this.http.get(url);
    }

    updateReceipt(data) {
        const url = this.receiptUrl + 'update-receipt';
        return this.http.post(url, data);
    }

}
