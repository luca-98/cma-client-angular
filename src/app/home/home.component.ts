import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredentialsService } from '../core/service/credentials.service';
import { Role } from '../enum/role.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private credentialsService: CredentialsService
  ) { }

  ngOnInit(): void {
    this.router.navigateByUrl('/medical-examination', { replaceUrl: true });
  }

}
