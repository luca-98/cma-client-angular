import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './core/interceptor/jwt.interceptor';
import { LoaderInterceptor } from './core/interceptor/loader.interceptor';
import { ApiErrorInterceptor } from './core/interceptor/api-error.interceptor';
import { ShellModule } from './shell/shell.module';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getVietnamesePaginatorIntl } from './core/vietnamese-paginator.intl';
import { DatePipe } from '@angular/common';
import { InjectableRxStompConfig, RxStompService, rxStompServiceFactory } from '@stomp/ng2-stompjs';
import { stompConfig } from './core/stomp.config';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ShellModule,
    AppRoutingModule
  ],
  providers: [
    Title,
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true },
    { provide: MatPaginatorIntl, useValue: getVietnamesePaginatorIntl() },
    { provide: InjectableRxStompConfig, useValue: stompConfig },
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [InjectableRxStompConfig]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
