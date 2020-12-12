import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DebtPaymentSlipService {

    private debtPaymentSlipUrl = environment.apiUrl + '/debt-payment-slip/';

    constructor(
        private http: HttpClient
    ) { }

    searchByName(name) {
        const url = this.debtPaymentSlipUrl + 'search-by-name';
        const params = new HttpParams().set('name', name);
        return this.http.get(url, { params });
    }
    searchByCode(patientCode) {
        const url = this.debtPaymentSlipUrl + 'search-by-code';
        const params = new HttpParams().set('patientCode', patientCode);
        return this.http.get(url, { params });
    }
    getNumberVoucher() {
        const url = this.debtPaymentSlipUrl + 'get-number-voucher';
        return this.http.get(url);
    }

    getAllInvoiceDetailDebtByPatientId(patientId, pageSize, pageIndex) {
        const url = this.debtPaymentSlipUrl + 'get-all-invoice-detail-debt-by-patientId';
        const params = new HttpParams()
            .set('patientId', patientId)
            .set('pageSize', pageSize)
            .set('pageIndex', pageIndex);
        return this.http.get(url, { params });
    }

    saveDebtPaymentSlip(data) {
        const url = this.debtPaymentSlipUrl + 'save-debt-payment-slip';
        return this.http.post(url, data);
    }

    searchAllInvoiceDetailDebt(dataSearch, pageSize, pageIndex) {
        const url = this.debtPaymentSlipUrl + 'search-all-invoice-detail-debt';
        const params = new HttpParams()
            .set('patientId', dataSearch.patientId)
            .set('startDate', dataSearch.startDate)
            .set('endDate', dataSearch.endDate)
            .set('pageSize', pageSize)
            .set('pageIndex', pageIndex);
        return this.http.get(url, { params });
    }

    getNumberVoucherPay() {
        const url = this.debtPaymentSlipUrl + 'get-number-voucher-pay';
        return this.http.get(url);
    }

    getAllReceiptDebtBySupplierId(supplierId, pageIndex, pageSize) {
        const url = this.debtPaymentSlipUrl + 'get-all-receipt-debt-by-supplierId';
        const params = new HttpParams().set('supplierId', supplierId)
            .set('pageIndex', pageIndex)
            .set('pageSize', pageSize);
        return this.http.get(url, { params });
    }

    searchByNameSupplier(supplierNameSearch) {
        const url = this.debtPaymentSlipUrl + 'search-by-name-supplier';
        const params = new HttpParams().set('supplierNameSearch', supplierNameSearch);
        return this.http.get(url, { params });
    }

    searchByNamePhone(phone) {
        const url = this.debtPaymentSlipUrl + 'search-by-name-phone';
        const params = new HttpParams().set('phone', phone);
        return this.http.get(url, { params });
    }

    saveDebtPaymentSlipSupplier(data) {
        const url = this.debtPaymentSlipUrl + 'save-debt-payment-slip-supplier';
        return this.http.post(url, data);
    }

}
