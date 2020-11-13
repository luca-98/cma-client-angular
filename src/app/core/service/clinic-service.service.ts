import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ClinicServiceService {

    private clinicServiceUrl = environment.apiUrl + '/service/';

    constructor(
        private http: HttpClient
    ) { }

    getAllServiceByGroupService(groupServiceCode: any) {
        const url = this.clinicServiceUrl + 'get-all-service-by-group-service';
        const params = new HttpParams().set('groupServiceCode', groupServiceCode);
        return this.http.get(url, { params });
    }

    findServiceInGroupService(serviceName: any, groupServiceCode: any) {
        const url = this.clinicServiceUrl + 'find-service-in-group-service';
        const params = new HttpParams()
            .set('serviceName', serviceName)
            .set('groupServiceCode', groupServiceCode);
        return this.http.get(url, { params });
    }

    getAllService() {
        const url = this.clinicServiceUrl + 'get-all-service';
        return this.http.get(url);
    }
}
