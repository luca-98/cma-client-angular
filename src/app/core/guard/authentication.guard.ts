import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CredentialsService } from '../service/credentials.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivateChild {

  constructor(
    private router: Router,
    private credentialsService: CredentialsService
  ) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.credentialsService.isAuthenticated()) {
      // check if route is restricted by role
      if (route.data.userGroupCode || route.data.permissionCode) {
        if (route.data.userGroupCode) {
          const userUserGroupCode = this.credentialsService.credentials.userGroupCode;
          for (const routeUserGroupCode of route.data.userGroupCode) {
            // authorised so return true
            if (routeUserGroupCode === userUserGroupCode) {
              return true;
            }
          }
        }
        if (route.data.permissionCode) {
          const userPermissionCode = this.credentialsService.credentials.permissionCode;
          for (const routePerCode of route.data.permissionCode) {
            for (const userPerCode of userPermissionCode) {
              // authorised so return true
              if (routePerCode === userPerCode) {
                return true;
              }
            }
          }
        }
        // role not authorised so redirect to home page
        // TODO redirect to error 403 page
        this.router.navigateByUrl('/', { replaceUrl: true });
      } else {
        // no authorization so return true
        return true;
      }
    }

    this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
    return false;
  }
}
