import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GroupMedicineService {

    private groupMedicinetUrl = environment.apiUrl + '/group-medicine/';

    constructor(
        private http: HttpClient
    ) { }

    getAllGroupMedicine() {
        const url = this.groupMedicinetUrl + 'get-all-group-medicine';
        return this.http.get(url);
    }




}
