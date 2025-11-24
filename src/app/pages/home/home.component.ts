import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';

interface Course {
  title: string;
  lastAccessed: string;
  progress: number;
  color: string;
  thumbnail: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class HomeComponent implements OnInit {
  searchQuery: string = '';
  userName: string = 'John';

  recentCourses: Course[] = [
    {
      title: 'Advanced React Patterns',
      lastAccessed: '2 hours ago',
      progress: 65,
      color: 'blue',
      thumbnail: 'assets/default-course.png'
    },
    {
      title: 'Machine Learning Basics',
      lastAccessed: 'yesterday',
      progress: 42,
      color: 'green',
      thumbnail: 'assets/default-course.png'
    }
  ];

  categories = ['All', 'L1', 'L2', 'L3SI', 'L3ISIL', 'M1ISIL', 'M2ISIL', 'M1GSI', 'M2GSI'];

  courses: any[] = [];
  filteredCourses: any[] = [];
  paginatedCourses: any[] = [];
  isLoading: boolean = true;
  error: string = '';
  userId: number = 0;

  constructor(private router: Router, private http: HttpClient) {

  }
  checkAuth() {
    this.http.get<any>("http://localhost:8080/backend/check_auth.php", {
      withCredentials: true
    }).subscribe({
      next: (res) => {
        if (res.success && res.user) {
          this.userId = res.user.id;
          this.userName = res.user.name;

          this.getCourses();
          this.loadEnrolledCourses(this.userId);
        } else {
          console.error("Auth failed:", res.error);

        }
      },
      error: (err) => {
        console.error("Auth error:", err);
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnInit() {
    this.checkAuth();
    this.getCourses()

  }



  getCourses() {
    this.isLoading = true;
    this.error = '';
    this.http.get<any[]>(`http://localhost:8080/backend/get_courses.php?user_id=${this.userId}`, {
      withCredentials: true
    }).subscribe({
      next: (data) => {
        console.log('All courses =', data);
        this.courses = data.map(course => ({
          ...course,
          enrolled: course.enrolled === 'yes',
          progress: course.progress || 0,
          color: 'blue',
          thumbnail: course.thumbnail
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        this.error = 'Failed to load courses.';
        this.isLoading = false;
      }
    });
  }

  loadEnrolledCourses(userId: number) {
    this.http.get<any[]>(`http://localhost:8080/backend/get_enrolled_courses.php?user_id=${userId}`, {
      withCredentials: true
    }).subscribe({
      next: (data) => {
        console.log("Enrolled courses =", data);
        if (Array.isArray(data)) {
          this.recentCourses = data.map(course => ({
            title: course.title,
            lastAccessed: course.lastAccessed || "Recently",
            progress: course.progress || 0,
            color: "blue",
            thumbnail: course.thumbnail || 'assets/default-course.png'
          }));
        }
      },
      error: (err) => {
        console.error("Failed to load enrolled courses", err);
      }
    });
  }

  navigateTo(route: string) {


    this.router.navigate([`/${route}`]);


  }



  onSearch() {
    console.log('Searching for:', this.searchQuery);
  }
}
