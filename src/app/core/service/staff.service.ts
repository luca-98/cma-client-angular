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

    getAuthenObj(id: any) {
        const url = this.staffUrl + 'get-authen-object/' + id;
        return this.http.get(url);
    }

    updateGroupServiceStaff(id: any, listGroupService: any) {
        const url = this.staffUrl + 'update-group-service-staff/' + id;
        const formData = new FormData();
        formData.append('listGroupService', listGroupService);
        return this.http.put(url, formData);
    }

    updateRoomStaff(id: any, roomId: any) {
        const url = this.staffUrl + 'update-room-staff/' + id;
        const formData = new FormData();
        if (roomId != null) {
            formData.append('roomId', roomId);
        }
        return this.http.put(url, formData);
    }
}
