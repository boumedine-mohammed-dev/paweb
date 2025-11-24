import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface CourseLesson {
  id: number;
  title: string;
  type: string;
  completed?: boolean;
}

interface CourseSection {
  id: number;
  title: string;
  isExpanded: boolean;
  lessons: CourseLesson[];
}

interface CourseDetails {

  title: string;
  total_lessons: number;
  completed_lessons: number;
  progress: number;
  sections: CourseSection[];
}

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {
  courseId: string = '';
  course: CourseDetails | null = null;
  isLoading: boolean = true;
  error: string = '';
  allExpanded: boolean = false;
  courses: any[] = [];
  progress: number = 0;
  userId: number = 0;
  completed: number = 0;
  total: number = 0;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.courseId = this.route.snapshot.params['id'];
    console.log('Course ID:', this.courseId);

    this.loadUser();

  }

  // Fetch course details from backend
  getCourseDetails() {
    this.isLoading = true;
    this.error = '';

    console.log('Fetching course details...');

    this.http.get<any>(`http://localhost:8080/backend/get_course_details.php?id=${this.courseId}&user_id=${this.userId}`)
      .subscribe({
        next: (data) => {
          console.log('Backend Response:', data);
          console.log('Backend Response:', data.lessons);
          // Check if data is valid
          if (!data) {
            console.error('No data received from backend');
            this.error = 'No data received';
            this.isLoading = false;
            this.useDummyData();
            return;
          }

          // Map the backend data
          this.course = {
            title: data.course_name || "Course Title",
            completed_lessons: data.completed_lessons,
            total_lessons: data.total_lessons,
            progress: this.progress,
            sections: []
          };

          console.log(' Response:', this.course?.progress);
          // Check if backend returns sections array
          if (data.sections && Array.isArray(data.sections)) {
            this.course.sections = data.sections.map((section: any) => ({
              id: section.id,
              title: section.title,
              isExpanded: false,
              lessons: section.lessons.map((lesson: any) => ({
                id: lesson.id,
                title: lesson.title || lesson.lesson_title,
                type: lesson.type || "PDF",
                duration: lesson.duration || "",
                //
                completed: lesson.completed !== undefined ? lesson.completed : false
              }))
            }));
          }

          // If backend returns flat lessons array
          // If backend returns flat lessons array
          else if (data.lessons && Array.isArray(data.lessons)) {
            this.course.sections = [{
              id: 1,
              title: "Course && TD && Exam",
              isExpanded: true,
              lessons: data.lessons.map((lesson: any) => ({
                id: lesson.id,
                title: lesson.title || lesson.lesson_title,
                type: lesson.type || "PDF",
                duration: lesson.duration || "",
                completed: lesson.completed !== undefined ? lesson.completed : false
              }))
            },];
          }

          // If no lessons at all
          else {
            this.course.sections = [{
              id: 1,
              title: "Course Lessons",
              isExpanded: true,
              lessons: []
            }];
          }

          this.isLoading = false;
          console.log('Mapped Course Data:', this.course);
        },
        error: (err) => {
          console.error('Error fetching course details:', err);
          this.error = 'Error';
          this.isLoading = false;

          // Use dummy data for testing
          setTimeout(() => {
            this.useDummyData();
          }, 1000);
        }
      });
  }

  // Dummy data for testing
  useDummyData() {
    console.log('Using dummy data...');

    this.course = {

      title: 'Windev - Développement Logiciel Complet',

      completed_lessons: 0,
      total_lessons: 2,
      progress: 45,
      sections: [
        {
          id: 1,
          title: 'TP - Part1 : Création de logiciel sans BDD',
          isExpanded: false,
          lessons: [
            { id: 1, title: '1- Windev - Introduction', type: 'Page', completed: true },
            { id: 2, title: '2- Création d\'une fenêtre', type: 'Page', completed: true },
            { id: 3, title: '3- Attributs et Design', type: 'Page', completed: false },
            { id: 4, title: '4- Le premier code', type: 'Page', completed: false },
          ]
        },
        {
          id: 2,
          title: 'TP - Part2 : Création avec BDD',
          isExpanded: false,
          lessons: [
            { id: 5, title: '16- Création BDD', type: 'Page', completed: false },
            { id: 6, title: '17- Création tables', type: 'Page', completed: false },
          ]
        },
        {
          id: 3,
          title: 'Cours et TD GL',
          isExpanded: false,
          lessons: [
            { id: 7, title: 'cours partie I génie logiciel', type: 'PDF', completed: false },
            { id: 8, title: 'Cours GL Partie II UML', type: 'PDF', completed: false },
            { id: 9, title: 'TD 4 GL énoncé', type: 'PDF', completed: false },
          ]
        }
      ]
    };

    this.isLoading = false;
    this.error = '';
    console.log('Dummy data loaded:', this.course);
  }

  // Toggle section expansion
  toggleSection(section: CourseSection) {
    section.isExpanded = !section.isExpanded;
  }

  // Toggle all sections
  toggleAll() {
    this.allExpanded = !this.allExpanded;
    if (this.course) {
      this.course.sections.forEach(section => {
        section.isExpanded = this.allExpanded;
      });
    }
  }
  loadUser() {
    this.http.get<any>('http://localhost:8080/backend/get_user.php', {
      withCredentials: true
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.userId = res.user_id;
          console.log("User ID from DB =", this.userId);
          this.getCourses();
        } else {
          console.error("User error:", res.error);
        }
      },
      error: (err) => {
        console.error("Failed to load user", err);
      }
    });
  }

  updateProgress() {
    if (!this.course) return;
    const completed = this.getCompletedCount();
    const total = this.getTotalLessons();
    this.course.progress = total ? Math.round((completed / total) * 100) : 0;

    const body = {
      user_id: this.userId,
      course_id: Number(this.courseId),
      completed_lessons: completed,
      total_lessons: total
    };

    this.http.post<any>("http://localhost:8080/backend/update_progress.php", body, { withCredentials: true })
      .subscribe({
        next: (res) => {
          if (res.progress !== undefined) {
            this.course!.progress = res.progress;
          }
        }
      });
  }


  // Open lesson - downloads PDF
  openLesson(lesson: CourseLesson) {
    console.log('Opening lesson:', lesson);

    if (lesson.type === 'PDF' || lesson.type === 'DOCX') {
      window.open(`http://localhost:8080/backend/download_pdf.php?id=${lesson.id}`, '_blank');
    }

    lesson.completed = true;
    this.updateProgress();

  }
  getCourses() {
    this.isLoading = true;
    this.error = '';
    console.log("userid=", this.userId);

    this.http.get<any[]>(`http://localhost:8080/backend/get_courses.php?user_id=${this.userId}`, {
      withCredentials: true
    }).subscribe({
      next: (data) => {
        console.log("Courses data:", data);


        const currentCourse = data.find(course => course.id == this.courseId);
        if (currentCourse) {
          this.progress = currentCourse.progress || 0;
        }

        this.isLoading = false;


        this.getCourseDetails();
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        this.error = 'Failed to load courses.';
        this.isLoading = false;
      }
    });
  }



  // Get completed lessons count
  getCompletedCount(): number {
    if (!this.course) return 0;
    let count = 0;
    this.course.sections.forEach(section => {
      section.lessons.forEach(lesson => {
        if (lesson.completed) count++;
      });
    });
    this.course.completed_lessons = count;
    return count;
  }
  // Get total lessons count
  getTotalLessons(): number {
    if (!this.course) return 0;
    let count = 0;
    this.course.sections.forEach(section => {
      count += section.lessons.length;
    });
    return this.course.total_lessons = count;
  }

  // Back to courses
  goBack() {
    this.router.navigate(['/courses']);
  }
}
