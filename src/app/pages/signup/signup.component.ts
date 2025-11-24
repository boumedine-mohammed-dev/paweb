import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  fullName: string = '';
  email: string = '';
  phone: string = '';
  student_id: string = '';
  level: string = '';
  password: string = '';
  confirmPassword: string = '';

  acceptTerms: boolean = false;

  passwordStrength: string = '';
  passwordStrengthColor: string = '';

  errors: any = {
    fullName: '', email: '', phone: '', student_id: '',
    level: '', password: '', confirmPassword: '', terms: ''
  };

  constructor(private router: Router, private api: Api, private cookieService: CookieService) { }

  checkPasswordStrength() {
    const password = this.password;
    if (!password) { this.passwordStrength = ''; return; }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) {
      this.passwordStrength = 'Weak';
      this.passwordStrengthColor = '#ef4444';
    } else if (strength <= 3) {
      this.passwordStrength = 'Medium';
      this.passwordStrengthColor = '#f59e0b';
    } else {
      this.passwordStrength = 'Strong';
      this.passwordStrengthColor = '#10b981';
    }
  }

  validateForm(): boolean {
    let isValid = true;

    this.errors = {
      fullName: '', email: '', phone: '', student_id: '',
      level: '', password: '', confirmPassword: '', terms: ''
    };

    if (!this.fullName.trim()) { this.errors.fullName = 'Full name is required'; isValid = false; }
    if (!this.email.trim()) { this.errors.email = 'Email is required'; isValid = false; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.email && !emailRegex.test(this.email)) {
      this.errors.email = 'Invalid email format';
      isValid = false;
    }

    if (!this.phone.trim()) { this.errors.phone = 'Phone is required'; isValid = false; }
    if (!this.student_id.trim()) { this.errors.student_id = 'Student ID is required'; isValid = false; }
    if (!this.level.trim()) { this.errors.level = 'Level is required'; isValid = false; }

    if (!this.password) { this.errors.password = 'Password is required'; isValid = false; }
    if (this.password.length < 8) { this.errors.password = 'Password must be at least 8 characters'; isValid = false; }

    if (!this.confirmPassword) { this.errors.confirmPassword = 'Please confirm your password'; isValid = false; }
    if (this.password !== this.confirmPassword) { this.errors.confirmPassword = 'Passwords do not match'; isValid = false; }

    if (!this.acceptTerms) { this.errors.terms = 'You must accept the terms'; isValid = false; }

    return isValid;
  }

  onSubmit() {
    if (this.validateForm()) {

      this.api.signup({
        name: this.fullName,
        email: this.email,
        password: this.password,
        phone: this.phone,
        student_id: this.student_id,
        level: this.level
      }).subscribe((res: any) => {

        if (res.success) {
          alert('Account created successfully!');
          this.router.navigate(['/']);
        } else {
          alert(res.message || 'Error occurred.');
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
