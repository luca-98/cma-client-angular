import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReceiptVoucherService {

    private receiptVoucherUrl = environment.apiUrl + '/receipt-voucher/';

    constructor(
        private http: HttpClient
    ) { }


    getNumberVoucher() {
        const url = this.receiptVoucherUrl + 'get-number-voucher';
        return this.http.get(url);
    }

    savePaymentVoucher(data) {
        const url = this.receiptVoucherUrl + 'save-receipt-voucher';
        return this.http.post(url, data);
    }

}
