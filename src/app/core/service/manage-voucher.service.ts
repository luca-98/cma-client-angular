import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ManageVoucherService {

    private manageVoucherUrl = environment.apiUrl + '/manage-voucher/';

    constructor(
        private http: HttpClient
    ) { }


    getAllVoucher() {
        const url = this.manageVoucherUrl + 'get-all-voucher';
        return this.http.get(url);
    }

    getAllVoucherType() {
        const url = environment.apiUrl + '/voucher-type/get-voucher-type';
        return this.http.get(url);
    }

    searchAllVoucher(dataPost) {
        const url = this.manageVoucherUrl + 'search-all-voucher';
        const params = new HttpParams()
            // .set('patientNameSearch', dataPost.patientNameSearch)
            .set('patientCode', dataPost.patientCode)
            .set('staffNameSearch', dataPost.staffNameSearch)
            // .set('supplierNameSearch', dataPost.supplierNameSearch)
            .set('startDate', dataPost.startDate)
            .set('endDate', dataPost.endDate)
            .set('objectSearch', dataPost.objectSearch)
            .set('voucherTypeId', dataPost.voucherTypeId);
        return this.http.get(url, { params });
    }

    getDetalVoucherById(idVoucher) {
        const url = this.manageVoucherUrl + 'get-detal-voucher-by-id';
        const params = new HttpParams()
            .set('idVoucher', idVoucher);
        return this.http.get(url, { params });
    }

    getAutoNameObject(objectSearch) {
        const url = this.manageVoucherUrl + 'get-auto-name-object';
        const params = new HttpParams()
            .set('objectSearch', objectSearch);
        return this.http.get(url, { params });
    }

}
