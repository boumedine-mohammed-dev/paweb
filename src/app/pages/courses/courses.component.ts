import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  searchQuery: string = '';
  selectedCategory: string = 'All';
  currentPage: number = 1;
  itemsPerPage: number = 6;
  Math = Math;

  categories = ['All', 'L1', 'L2', 'L3SI', 'L3ISIL', 'M1ISIL', 'M2ISIL', 'M1GSI', 'M2GSI'];

  courses: any[] = [];
  filteredCourses: any[] = [];
  paginatedCourses: any[] = [];
  isLoading: boolean = true;
  error: string = '';
  userId: number = 0;

  constructor(private router: Router, private cookieService: CookieService, private http: HttpClient) { }

  ngOnInit() {
    this.loadUser();
  }


  loadUser() {
    this.http.get<any>('http://localhost:8080/backend/get_user.php', { withCredentials: true })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.userId = res.user_id;

            this.getCourses();
          } else {
            console.error("User error:", res.error);
          }
        },
        error: (err) => console.error("Failed to load user", err)
      });
  }



  selectCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.applyFilter();
  }


  getCourses() {
    this.isLoading = true;
    this.error = '';

    this.http.get<any[]>(`http://localhost:8080/backend/get_courses.php?user_id=${this.userId}`, {
      withCredentials: true
    }).subscribe({
      next: (data) => {
        this.courses = data.map(course => ({
          ...course,
          color: this.getLevelColor(course.level),
          enrolled: course.enrolled === "yes",
          progress: course.progress || 0
        }));
        this.isLoading = false;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        this.error = 'Failed to load courses.';
        this.isLoading = false;
      }
    });
  }

  enroll(course: any) {
    this.http.post<any>('http://localhost:8080/backend/enroll_course.php',
      { course_id: course.id },
      { withCredentials: true }
    ).subscribe({
      next: (res) => {

        console.log("Enroll success", res);
        this.getCourses();
      },
      error: (err) => console.error('Enroll failed:', err)
    });
  }

  getLevelColor(level: string): string {
    const colorMap: { [key: string]: string } = {
      'L1': 'blue', 'L2': 'green', 'L3SI': 'purple', 'L3ISIL': 'red',
      'M1ISIL': 'orange', 'M2ISIL': 'pink', 'M1GSI': 'indigo', 'M2GSI': 'teal'
    };
    return colorMap[level] || 'blue';
  }

  applyFilter() {
    let filtered = this.courses;

    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.level === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(q) ||
        course.level.toLowerCase().includes(q)
      );
    }

    this.filteredCourses = filtered;
    this.updatePagination();
  }

  onSearch() {
    this.currentPage = 1;
    this.applyFilter();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCourses = this.filteredCourses.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCourses.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  navigateToCours(route: string) {
    this.router.navigate([`/course/${route}`]);
  }
}
