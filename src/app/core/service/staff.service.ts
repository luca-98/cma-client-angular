import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StaffService {

    private staffUrl = environment.apiUrl + '/staff/';

    constructor(
        private http: HttpClient
    ) { }

    getDoctorByGroupServiceCode(groupServiceCode) {
        const url = this.staffUrl + 'get-all-staff-by-group-service';
        const params = new HttpParams()
            .set('groupServiceCode', groupServiceCode);
        return this.http.get(url, { params });
    }

    getAllStaff() {
        const url = this.staffUrl + 'get-all-staff';
        return this.http.get(url);
    }
}
