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

    addNewGroupService(data) {
        const url = this.groupServiceUrl + 'add-new-group-service';
        return this.http.post(url, data);
    }

    getDetailGroupService(groupServiceId) {
        const url = this.groupServiceUrl + 'get-detail-group-service';
        const params = new HttpParams().set('groupServiceId', groupServiceId);
        return this.http.get(url, { params });
    }

    editNewGroupService(data) {
        const url = this.groupServiceUrl + 'edit-new-group-service';
        return this.http.post(url, data);
    }

    deleteGroupService(groupServiceId) {
        const url = this.groupServiceUrl + 'delete-group-service';
        const formData = new FormData();
        formData.append('groupServiceId', groupServiceId);
        return this.http.put(url, formData);
    }

}
