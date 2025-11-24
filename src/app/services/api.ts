import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Api {
  baseUrl = "http://localhost:8080/backend/";

  constructor(private http: HttpClient) { }

  // === Auth ===
  signup(data: any) {
    return this.http.post(this.baseUrl + "signup.php", data, { withCredentials: true });
  }

  login(data: any) {
    return this.http.post(this.baseUrl + "login.php", data, { withCredentials: true });
  }

  // === Courses ===
  getCourses() {
    return this.http.get(this.baseUrl + "get_courses.php", { withCredentials: true });
  }

  getCourseDetails(courseId: number) {
    return this.http.get(this.baseUrl + `get_course_details.php?id=${courseId}`, { withCredentials: true });
  }

  // === Download PDF ===
  downloadPdf(lessonId: number) {
    //
    return this.http.get(this.baseUrl + `download_pdf.php?id=${lessonId}`, {
      responseType: 'blob',
      withCredentials: true
    });
  }
}
