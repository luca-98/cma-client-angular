import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Credentials, CredentialsService } from './credentials.service';


export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private loginUrl = environment.apiUrl + '/auth/login';

  constructor(
    private credentialsService: CredentialsService,
    private http: HttpClient
  ) { }

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  login(context: LoginContext): Observable<Credentials> {
    const formData = new FormData();
    formData.append('username', context.username);
    formData.append('password', context.password);

    return this.http.post(this.loginUrl, formData)
      .pipe(map((data: any) => {
        const user = {
          token:  data.message.token,
          userName:  data.message.userName,
          fullName:  data.message.fullName,
          roomName:  data.message.roomName,
          userGroupCode:  data.message.userGroupCode,
          permissionCode: data.message.permissionCode,
          staffId:  data.message.staffId,
          roomId:  data.message.roomId,
        };
        // login successful if there's a jwt token in the response
        if (user && user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.credentialsService.setCredentials(user, context.remember);
        }
        return user;
      }));
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize credentials invalidation here
    this.credentialsService.setCredentials();
    return of(true);
  }
}
