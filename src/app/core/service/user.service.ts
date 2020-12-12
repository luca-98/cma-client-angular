import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userUrl = environment.apiUrl + '/user/';

  constructor(
    private http: HttpClient
  ) { }

  getAllUser() {
    const url = this.userUrl;
    return this.http.get(url);
  }

  deleteUser(id: any) {
    const url = this.userUrl + id;
    return this.http.delete(url);
  }

  changePassword(id: any, password: any) {
    const url = this.userUrl + 'change-password/' + id;
    const formData = new FormData();
    formData.append('password', password);
    return this.http.put(url, formData);
  }

  addUser(user: any) {
    const url = this.userUrl;
    return this.http.post(url, user);
  }

  updateUser(user: any) {
    const url = this.userUrl;
    return this.http.put(url, user);
  }

  changeStatusStaff(staffId: any, status: any) {
    const url = this.userUrl + 'change-status-staff/' + staffId;
    const formData = new FormData();
    formData.append('status', status);
    return this.http.put(url, formData);
  }
}
