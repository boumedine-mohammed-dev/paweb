// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  level: string;
  studentId: string;
  joinDate: string;
  totalCourses: number;
  completedCourses: number;
  certificates: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  isLoading: boolean = true;
  isEditing: boolean = false;
  isSaving: boolean = false;
  error: string = '';
  successMessage: string = '';

  editForm: Partial<UserProfile> = {};

  showPasswordModal: boolean = false;
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  passwordError: string = '';

  selectedFile: File | null = null;
  avatarPreview: string | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.loadProfile();
  }

  // ==================== Load Profile from check_auth.php ====================
  loadProfile() {
    this.isLoading = true;
    this.error = '';

    this.http.get<any>('http://localhost:8080/backend/check_auth.php', { withCredentials: true })
      .subscribe({
        next: (res) => {
          console.log("res=" + res)
          if (res.success && res.user) {
            const data = res.user;
            console.log("res=" + data)
            this.profile = {
              id: data.id,
              fullName: data.fullName || data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              level: data.level || '',
              studentId: data.studentId || data.student_id || '',
              joinDate: data.joinDate || data.created_at || new Date().toISOString(),
              totalCourses: res.stats.total_courses || 0,
              completedCourses: res.stats.completed_courses || 0,
              certificates: data.certificates || 0
            };
            this.isLoading = false;
          } else {
            this.error = res.error || 'field';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          this.error = 'field';
          this.isLoading = false;
        }
      });
  }
  // ==================== Logout ====================
  logout() {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }

  // ==================== Navigation ====================
  goToCourses() {
    this.router.navigate(['/courses']);
  }
  navigateTo(route: string) {

    this.router.navigate([`/${route}`]);


  }
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
