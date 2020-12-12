import { LoginContext } from './../core/service/authentication.service';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService } from '../core/service/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent } from '../shared/toast/toast.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { LoaderService } from '../core/service/loader.service';
import { CredentialsService } from '../core/service/credentials.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  subscription: Subscription;
  errorMessage = '';

  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private titleService: Title,
    private loaderService: LoaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private credentialsService: CredentialsService
  ) {
    this.loaderService.loaderSubject.subscribe((value: boolean) => {
      this.isLoading = value;
      changeDetectorRef.detectChanges();
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Đăng nhập vào hệ thống');
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [true]
    });
    if (this.credentialsService.isAuthenticated) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  login(): void {
    const loginContext: LoginContext = {
      username: this.loginForm.get('username').value.trim(),
      password: this.loginForm.get('password').value.trim(),
      remember: this.loginForm.get('rememberMe').value
    };
    const validateUser = loginContext.username.match(/[^a-z0-9.]/gmi);
    const validatePassword = loginContext.password.match(/[^a-z0-9.]/gmi);
    if (!validateUser && !validatePassword) {
      if (loginContext.username === '' && loginContext.password === '') {
        this.errorMessage = 'Tên đăng nhập và mật khẩu không được để trống!';
      } else if (loginContext.username === '') {
        this.errorMessage = 'Tên đăng nhập không được để trống!';
      } else if (loginContext.password === '') {
        this.errorMessage = 'Mật khẩu không được để trống!';
      }
      else {
        this.subscription = this.authenticationService
          .login(loginContext).subscribe(
            () => {
              this.route.queryParams.subscribe(params =>
                this.router.navigate([params.redirect || '/'], { replaceUrl: true })
              );
            },
            (error) => {
              this.errorMessage = 'Tài khoản hoặc mật khẩu không đúng!';
              this.snackBar.openFromComponent(ToastComponent, {
                duration: 3000,
                verticalPosition: 'top',
                data: { message: 'Đăng nhập không thành công' }
              });
            }
          );
      }
    } else {
      this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không được để trống hoặc chứa kí tự đặc biệt!';
    }
  }
}
