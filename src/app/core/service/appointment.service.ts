import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {

    private appointmentUrl = environment.apiUrl + '/appointment/';

    constructor(
        private http: HttpClient
    ) { }

    addPatientAppointment(appointmentData) {
        const url = this.appointmentUrl + 'add-patient-appointment';
        const formData = new FormData();
        if (appointmentData.patientCode !== '') {
            formData.append('patientCode', appointmentData.patientCode);
        }
        formData.append('patientName', appointmentData.patientName);
        formData.append('phone', appointmentData.phone);
        formData.append('debt', appointmentData.debt ? appointmentData.debt : 0);
        formData.append('dateOfBirth', appointmentData.dateOfBirth ? appointmentData.dateOfBirth : '');
        formData.append('gender', appointmentData.gender ? appointmentData.gender : '');
        formData.append('address', appointmentData.address ? appointmentData.address : '');
        formData.append('staffId', appointmentData.staffId ? appointmentData.staffId : '');
        formData.append('appointmentDate', appointmentData.appointmentDate ? appointmentData.appointmentDate : '');
        formData.append('appointmentTime', appointmentData.appointmentTime ? appointmentData.appointmentTime : '');
        return this.http.post(url, formData);
    }


    getAllAppointment(pageSize: any, pageIndex: any) {
        const url = this.appointmentUrl + 'get-all-appointment';
        const params = new HttpParams().set('pageSize', pageSize)
            .set('pageIndex', pageIndex);
        return this.http.get(url, { params });
    }

    searchAllAppointment(searchData: any, pageSize: any, pageIndex: any) {
        const url = this.appointmentUrl + 'search-all-appointment';
        const params = new HttpParams()
            .set('pageSize', pageSize)
            .set('pageIndex', pageIndex)
            .set('patientCode', searchData.patientCode ? searchData.patientCode : '')
            .set('patientName', searchData.patientName ? searchData.patientName : '')
            .set('phone', searchData.phone ? searchData.phone : '')
            .set('startDate', searchData.startDate ? searchData.startDate : '')
            .set('endDate', searchData.endDate ? searchData.endDate : '')
            .set('status', searchData.status ? searchData.status : '');
        return this.http.get(url, { params });
    }

    changeStatus(id, status) {
        const url = this.appointmentUrl + 'change-status';
        const params = new HttpParams()
            .set('id', id)
            .set('status', status);
        return this.http.get(url, { params });
    }

    searchByName(name) {
        const url = this.appointmentUrl + 'search-by-name';
        const params = new HttpParams().set('name', name);
        return this.http.get(url, { params });
    }
    searchByCode(code) {
        const url = this.appointmentUrl + 'search-by-code';
        const params = new HttpParams().set('patientCode', code);
        return this.http.get(url, { params });
    }
    searchByPhone(phone) {
        const url = this.appointmentUrl + 'search-by-phone';
        const params = new HttpParams().set('phone', phone);
        return this.http.get(url, { params });
    }

    editAppointmentCreated(appointmentData) {
        const url = this.appointmentUrl + 'edit-appointment-created';
        const formData = new FormData();
        formData.append('appointmentDate', appointmentData.appointmentDate);
        formData.append('appointmentTime', appointmentData.appointmentTime);
        formData.append('staffId', appointmentData.staffId);
        formData.append('appointmentId', appointmentData.appointmentId);
        return this.http.put(url, formData);
    }

}
