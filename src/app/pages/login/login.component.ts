import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(
    private api: Api,
    private router: Router,
    private cookieService: CookieService
  ) {

  }

  onSubmit() {
    this.api.login({ email: this.email, password: this.password })
      .subscribe((res: any) => {
        if (res.success) {

          this.router.navigate(['/']);
        } else {
          alert("Login error");
        }
      });
  }

}
