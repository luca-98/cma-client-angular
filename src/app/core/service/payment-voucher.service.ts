import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentVoucherService {

    private paymentVoucherUrl = environment.apiUrl + '/payment-voucher/';

    constructor(
        private http: HttpClient
    ) { }


    getNumberVoucher() {
        const url = this.paymentVoucherUrl + 'get-number-voucher';
        return this.http.get(url);
    }

    savePaymentVoucher(data) {
        const url = this.paymentVoucherUrl + 'save-payment-voucher';
        return this.http.post(url, data);
    }

}
