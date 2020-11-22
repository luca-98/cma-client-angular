import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TemplateReportService {

    private templateReportUrl = environment.apiUrl + '/template-report/';
    private groupTemplateReportUrl = environment.apiUrl + '/group-template/';

    constructor(
        private http: HttpClient
    ) { }

    getAllTemplateReport() {
        const url = this.templateReportUrl;
        return this.http.get(url);
    }

    getOneTemplateReport(id: string) {
        const url = this.templateReportUrl + id;
        return this.http.get(url);
    }

    deleteTemplateReport(id: string) {
        const url = this.templateReportUrl + id;
        return this.http.delete(url);
    }

    updateTemplateReport(id: any, templateName: any, htmlReport: any, groupId: any) {
        const url = this.templateReportUrl + 'update-template-report';
        const formData = new FormData();
        if (id) {
            formData.append('id', id);
        }
        formData.append('templateName', templateName);
        formData.append('htmlReport', htmlReport);
        if (groupId) {
            formData.append('groupId', groupId);
        }
        return this.http.post(url, formData);
    }

    getAllGroupTemplateReport() {
        const url = this.groupTemplateReportUrl;
        return this.http.get(url);
    }

    addGroupTemplateReport(groupName: string) {
        const url = this.groupTemplateReportUrl;
        const formData = new FormData();
        formData.append('name', groupName);
        return this.http.post(url, formData);
    }

    editGroupTemplateReport(id: any, groupName: string) {
        const url = this.groupTemplateReportUrl + id;
        const formData = new FormData();
        formData.append('name', groupName);
        return this.http.put(url, formData);
    }

    deleteGroupTemplateReport(id: string) {
        const url = this.groupTemplateReportUrl + id;
        return this.http.delete(url);
    }
}
