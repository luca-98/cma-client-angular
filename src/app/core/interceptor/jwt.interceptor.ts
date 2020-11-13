import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CredentialsService } from '../service/credentials.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private credentialsService: CredentialsService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // add auth header with jwt if user is logged in and request is to api url
    if (this.credentialsService.isAuthenticated() && environment.apiUrl) {

      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.credentialsService.credentials.token}`
        }
      });
    }

    return next.handle(request);
  }
}
