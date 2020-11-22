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

    autoSearchNameService(serviceName) {
        const url = this.clinicServiceUrl + 'auto-search-name-service';
        const params = new HttpParams()
            .set('serviceName', serviceName);
        return this.http.get(url, { params });
    }

    getAllServicePagging(pageSize, pageIndex) {
        const url = this.clinicServiceUrl + 'get-all-service-pagging';
        const params = new HttpParams()
            .set('pageSize', pageSize)
            .set('pageIndex', pageIndex);
        return this.http.get(url, { params });
    }


    searchAllServicePagging(dataSearch, pageSize, pageIndex) {
        const url = this.clinicServiceUrl + 'search-all-service-pagging';
        const params = new HttpParams()
            .set('pageSize', pageSize)
            .set('serviceName', dataSearch.serviceName)
            .set('groupServiceId', dataSearch.groupServiceId)
            .set('pageIndex', pageIndex);
        return this.http.get(url, { params });
    }

    deleteService(id) {
        const url = this.clinicServiceUrl + 'delete-service';
        const formData = new FormData();
        formData.append('id', id);
        return this.http.put(url, formData);
    }

    addNewService(dataPost) {
        const url = this.clinicServiceUrl + 'add-new-service';
        return this.http.post(url, dataPost);
    }

    updateService(dataPost){
        const url = this.clinicServiceUrl + 'edit-a-service';
        return this.http.post(url, dataPost);
    }
}
