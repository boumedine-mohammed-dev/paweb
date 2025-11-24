import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
interface EnrolledCourse {
  id: number;
  title: string;
  progress: number;
  lastLesson: string;

}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userId: number = 0;
  userName: string = '';

  stats = [
    { title: 'Total Courses', value: 0, icon: 'book', color: 'blue' },
    { title: 'Completed', value: 0, icon: 'check', color: 'green' },
    { title: 'Certificates', value: 0, icon: 'award', color: 'purple' }
  ];

  activities: any[] = [];
  enrolledCourses: EnrolledCourse[] = [];
  isLoading: boolean = true;
  error: string = '';

  constructor(private router: Router, private http: HttpClient) {

  }

  ngOnInit() {
    this.loadUserAndCourses();
  }

  loadUserAndCourses() {
    this.isLoading = true;
    this.error = '';

    //
    this.http.get<any>('http://localhost:8080/backend/get_user.php', { withCredentials: true })
      .subscribe({
        next: (userData) => {
          if (userData.success) {
            this.userId = userData.user_id;
            this.userName = userData.name;
            console.log('User:', this.userId, this.userName);

            //
            this.loadEnrolledCourses();
          } else {
            this.error = userData.error || 'Failed to fetch user';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error fetching user:', err);
          this.error = 'Error fetching user data';
          this.isLoading = false;
        }
      });
  }

  loadEnrolledCourses() {
    if (!this.userId) {
      console.warn('User ID not set!');
      this.isLoading = false;
      return;
    }

    const url = `http://localhost:8080/backend/get_enrolled_courses.php?user_id=${this.userId}`;

    this.http.get<any[]>(url, { withCredentials: true })
      .subscribe({
        next: (data) => {
          console.log('Enrolled courses:', data);

          this.enrolledCourses = data.map(course => {
            console.log('Enrolled courses:', course.lastAccessed);
            return ({
              id: course.course_id,
              title: course.title,
              progress: course.progress || 0,
              lastLesson: course.lastAccessed || '',

            })
          });


          //
          this.stats[0].value = this.enrolledCourses.length;
          this.stats[1].value = this.enrolledCourses.filter(c => c.progress === 100).length;
          this.stats[2].value = this.enrolledCourses.filter(c => c.progress === 100).length;

          //
          this.activities = this.enrolledCourses.map(course => ({
            title: `Started ${course.title}`,
            color: 'blue',
            time: `Last accessed$: ${course.lastLesson}`,

          }));

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading enrolled courses:', err);
          this.error = 'Failed to load enrolled courses';
          this.isLoading = false;
        }
      });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);


  }
  logout() {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }
}
