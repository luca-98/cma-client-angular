import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MedicineService {

    private medicineUrl = environment.apiUrl + '/medicine/';

    constructor(
        private http: HttpClient
    ) { }

    getAllMedicineByGroupMedicine(groupId) {
        const url = this.medicineUrl + 'get-medicine-by-group-id';
        const params = new HttpParams().set('groupId', groupId);
        return this.http.get(url, { params });
    }

    searchMedicineByName(name){
        const url = this.medicineUrl + 'search-medicine-by-name';
        const params = new HttpParams().set('medicineName', name);
        return this.http.get(url, { params });
    }




}
