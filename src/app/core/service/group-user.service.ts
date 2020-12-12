import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupUserService {

  private groupUserUrl = environment.apiUrl + '/group-user/';

  constructor(
    private http: HttpClient
  ) { }

  getAllGroupUser() {
    const url = this.groupUserUrl;
    return this.http.get(url);
  }

  deleteGroupUser(id: any) {
    const url = this.groupUserUrl + id;
    return this.http.delete(url);
  }

  getListUser(id: any) {
    const url = this.groupUserUrl + 'get-list-user/' + id;
    return this.http.get(url);
  }

  getAllPermission() {
    const url = this.groupUserUrl + 'get-all-permission';
    return this.http.get(url);
  }

  getAllPermissionByUserGroup(id: any) {
    const url = this.groupUserUrl + 'get-all-permission-by-group-user/' + id;
    return this.http.get(url);
  }

  addNewGroupUser(groupName: any, listPermission: any) {
    const url = this.groupUserUrl + 'add-group-user';
    const formData = new FormData();
    formData.append('groupName', groupName);
    formData.append('listPermission', listPermission);
    return this.http.post(url, formData);
  }

  editGroupUser(id: any, groupName: any, listPermission: any) {
    const url = this.groupUserUrl + 'update-group-user/' + id;
    const formData = new FormData();
    formData.append('groupName', groupName);
    formData.append('listPermission', listPermission);
    return this.http.put(url, formData);
  }
}
