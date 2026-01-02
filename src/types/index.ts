// Tipos de usuário
export type UserRole = 'professor' | 'aluno';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Questão de múltipla escolha
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // índice da resposta correta (0-3)
}

// Prova/Exame
export interface Exam {
  id: string;
  lessonId: string;
  questions: Question[];
}

// Aula
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  externalLink: string; // YouTube, Google Docs, etc
  order: number;
  examId?: string;
}

// Curso
export interface Course {
  id: string;
  title: string;
  description: string;
  professorId: string;
  lessons: Lesson[];
  createdAt: string;
}

// Status da submissão da prova
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

// Resposta do aluno para uma questão
export interface StudentAnswer {
  questionId: string;
  selectedAnswer: number;
}

// Submissão da prova pelo aluno
export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  lessonId: string;
  courseId: string;
  answers: StudentAnswer[];
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Progresso do aluno em uma aula
export interface LessonProgress {
  lessonId: string;
  courseId: string;
  studentId: string;
  status: 'locked' | 'available' | 'completed';
  completedAt?: string;
}

// Progresso do aluno em um curso
export interface CourseProgress {
  courseId: string;
  studentId: string;
  lessonsProgress: LessonProgress[];
  currentLessonIndex: number;
}

// Vínculo de aluno a curso
export interface CourseEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: string;
  enrolledBy: string; // ID do professor que vinculou
}

// Estado global da aplicação
export interface AppState {
  users: User[];
  courses: Course[];
  exams: Exam[];
  submissions: ExamSubmission[];
  courseProgress: CourseProgress[];
  enrollments: CourseEnrollment[];
}
