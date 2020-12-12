import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RoomService {

    private roomUrl = environment.apiUrl + '/room-service/';

    constructor(
        private http: HttpClient
    ) { }

    getRoomByGroupServiceCode(groupServiceCode) {
        const url = this.roomUrl + 'get-list-room-service-by-group-service';
        const params = new HttpParams()
            .set('groupServiceCode', groupServiceCode);
        return this.http.get(url, { params });
    }

    getListRoomService() {
        const url = this.roomUrl + 'get-list-room-service';
        return this.http.get(url);
    }

    getCurrentRoomByStaff(id: any) {
        const url = this.roomUrl + 'get-current-room-by-staff/' + id;
        return this.http.get(url);
    }
}
