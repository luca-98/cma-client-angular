import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GroupServiceService {

    private groupServiceUrl = environment.apiUrl + '/group-service/';

    constructor(
        private http: HttpClient
    ) { }

    getAllGroupService() {
        const url = this.groupServiceUrl + 'get-all-group-service';
        return this.http.get(url);
    }

    getGroupServiceByStaff() {
        const url = this.groupServiceUrl + 'get-all-group-service-by-staff';
        return this.http.get(url);
    }


}