import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubclinicalService {

  private subclinicalUrl = environment.apiUrl + '/subclinical/';

  constructor(
    private http: HttpClient
  ) { }

  getStaffMinByService(serviceId: any) {
    const url = this.subclinicalUrl + 'get-staff-min-service';
    const params = new HttpParams()
      .set('serviceId', serviceId);
    return this.http.get(url, { params });
  }
}
