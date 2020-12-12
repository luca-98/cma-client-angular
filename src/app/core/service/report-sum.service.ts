import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReportSumService {

    private reportSumUrl = environment.apiUrl + '/report-sum/';

    constructor(
        private http: HttpClient
    ) { }

    getYearReport() {
        const url = this.reportSumUrl + 'get-year-report';
        return this.http.get(url);
    }
    showReportSum(data) {
        const url = this.reportSumUrl + 'show-report-sum';
        const params = new HttpParams()
            .set('startDate', data.startDate ? data.startDate : '')
            .set('endDate', data.endDate ? data.endDate : '')
            .set('year', data.year ? data.year : '')
            .set('type', data.type ? data.type : '');
        return this.http.get(url, { params });
    }


}
