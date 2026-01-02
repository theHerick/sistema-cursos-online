import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Course,
  Lesson,
  Exam,
  ExamSubmission,
  CourseProgress,
  LessonProgress,
  Question,
  StudentAnswer,
  CourseEnrollment,
  User,
} from '../types';
import { useAuth } from './AuthContext';

interface CoursesContextType {
  courses: Course[];
  exams: Exam[];
  submissions: ExamSubmission[];
  courseProgress: CourseProgress[];
  enrollments: CourseEnrollment[];
  students: User[];
  
  // Funções do Professor
  createCourse: (title: string, description: string) => void;
  addLesson: (courseId: string, title: string, externalLink: string) => void;
  createExam: (lessonId: string, questions: Question[]) => void;
  approveSubmission: (submissionId: string) => void;
  rejectSubmission: (submissionId: string) => void;
  getPendingSubmissions: (professorId: string) => ExamSubmission[];
  createStudent: (name: string) => void;
  enrollStudent: (studentId: string, courseId: string) => void;
  getEnrolledStudents: (courseId: string) => User[];
  getCourseEnrollments: (courseId: string) => CourseEnrollment[];
  
  // Funções do Aluno
  submitExam: (examId: string, lessonId: string, courseId: string, answers: StudentAnswer[]) => void;
  getStudentProgress: (studentId: string, courseId: string) => CourseProgress | undefined;
  canAccessLesson: (studentId: string, courseId: string, lessonIndex: number) => boolean;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const useCourses = () => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error('useCourses deve ser usado dentro de um CoursesProvider');
  }
  return context;
};

interface CoursesProviderProps {
  children: ReactNode;
}

export const CoursesProvider: React.FC<CoursesProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const coursesJson = localStorage.getItem('courses');
    const examsJson = localStorage.getItem('exams');
    const submissionsJson = localStorage.getItem('submissions');
    const progressJson = localStorage.getItem('courseProgress');
    const enrollmentsJson = localStorage.getItem('enrollments');
    const usersJson = localStorage.getItem('users');

    if (coursesJson) setCourses(JSON.parse(coursesJson));
    if (examsJson) setExams(JSON.parse(examsJson));
    if (submissionsJson) setSubmissions(JSON.parse(submissionsJson));
    if (progressJson) setCourseProgress(JSON.parse(progressJson));
    if (enrollmentsJson) setEnrollments(JSON.parse(enrollmentsJson));
    if (usersJson) {
      const allUsers: User[] = JSON.parse(usersJson);
      setStudents(allUsers.filter(u => u.role === 'aluno'));
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('courseProgress', JSON.stringify(courseProgress));
  }, [courseProgress]);

  useEffect(() => {
    localStorage.setItem('enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  // ===== FUNÇÕES DO PROFESSOR =====

  const createCourse = (title: string, description: string) => {
    if (!currentUser || currentUser.role !== 'professor') return;

    const newCourse: Course = {
      id: Date.now().toString(),
      title,
      description,
      professorId: currentUser.id,
      lessons: [],
      createdAt: new Date().toISOString(),
    };

    setCourses([...courses, newCourse]);
  };

  const addLesson = (courseId: string, title: string, externalLink: string) => {
    if (!currentUser || currentUser.role !== 'professor') return;

    const course = courses.find(c => c.id === courseId);
    if (!course || course.professorId !== currentUser.id) return;

    const newLesson: Lesson = {
      id: Date.now().toString(),
      courseId,
      title,
      externalLink,
      order: course.lessons.length,
    };

    const updatedCourses = courses.map(c =>
      c.id === courseId ? { ...c, lessons: [...c.lessons, newLesson] } : c
    );

    setCourses(updatedCourses);
  };

  const createExam = (lessonId: string, questions: Question[]) => {
    if (!currentUser || currentUser.role !== 'professor') return;

    const exam: Exam = {
      id: Date.now().toString(),
      lessonId,
      questions,
    };

    setExams([...exams, exam]);

    // Atualizar a aula com o ID do exame
    const updatedCourses = courses.map(course => ({
      ...course,
      lessons: course.lessons.map(lesson =>
        lesson.id === lessonId ? { ...lesson, examId: exam.id } : lesson
      ),
    }));

    setCourses(updatedCourses);
  };

  const approveSubmission = (submissionId: string) => {
    if (!currentUser || currentUser.role !== 'professor') return;

    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;

    // Atualizar status da submissão
    const updatedSubmissions = submissions.map(s =>
      s.id === submissionId
        ? {
            ...s,
            status: 'approved' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: currentUser.id,
          }
        : s
    );
    setSubmissions(updatedSubmissions);

    // Atualizar progresso do aluno
    const course = courses.find(c => c.id === submission.courseId);
    if (!course) return;

    const lessonIndex = course.lessons.findIndex(l => l.id === submission.lessonId);
    
    let progress = courseProgress.find(
      p => p.studentId === submission.studentId && p.courseId === submission.courseId
    );

    if (!progress) {
      // Criar novo progresso
      const lessonsProgress: LessonProgress[] = course.lessons.map((lesson, idx) => ({
        lessonId: lesson.id,
        courseId: course.id,
        studentId: submission.studentId,
        status: idx === 0 ? 'completed' : idx === 1 ? 'available' : 'locked',
        completedAt: idx === 0 ? new Date().toISOString() : undefined,
      }));

      progress = {
        courseId: course.id,
        studentId: submission.studentId,
        lessonsProgress,
        currentLessonIndex: Math.min(1, course.lessons.length - 1),
      };

      setCourseProgress([...courseProgress, progress]);
    } else {
      // Atualizar progresso existente
      const updatedProgress = courseProgress.map(p => {
        if (p.studentId === submission.studentId && p.courseId === submission.courseId) {
          const updatedLessonsProgress = p.lessonsProgress.map((lp, idx) => {
            if (idx === lessonIndex) {
              return { ...lp, status: 'completed' as const, completedAt: new Date().toISOString() };
            }
            if (idx === lessonIndex + 1) {
              return { ...lp, status: 'available' as const };
            }
            return lp;
          });

          return {
            ...p,
            lessonsProgress: updatedLessonsProgress,
            currentLessonIndex: Math.min(lessonIndex + 1, course.lessons.length - 1),
          };
        }
        return p;
      });

      setCourseProgress(updatedProgress);
    }
  };

  const rejectSubmission = (submissionId: string) => {
    if (!currentUser || currentUser.role !== 'professor') return;

    const updatedSubmissions = submissions.map(s =>
      s.id === submissionId
        ? {
            ...s,
            status: 'rejected' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: currentUser.id,
          }
        : s
    );

    setSubmissions(updatedSubmissions);
  };

  const getPendingSubmissions = (professorId: string) => {
    return submissions.filter(s => {
      const course = courses.find(c => c.id === s.courseId);
      return course?.professorId === professorId && s.status === 'pending';
    });
  };

  const createStudent = (name: string) => {
    if (!currentUser || currentUser.role !== 'professor') return;

    const newStudent: User = {
      id: Date.now().toString(),
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@aluno.com`,
      role: 'aluno',
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);

    // Atualizar localStorage de users
    const usersJson = localStorage.getItem('users');
    const allUsers: User[] = usersJson ? JSON.parse(usersJson) : [];
    allUsers.push(newStudent);
    localStorage.setItem('users', JSON.stringify(allUsers));
  };

  const enrollStudent = (studentId: string, courseId: string) => {
    if (!currentUser || currentUser.role !== 'professor') return;

    // Verificar se já está matriculado
    const alreadyEnrolled = enrollments.some(
      e => e.studentId === studentId && e.courseId === courseId
    );

    if (alreadyEnrolled) {
      alert('Aluno já está matriculado neste curso!');
      return;
    }

    const enrollment: CourseEnrollment = {
      id: Date.now().toString(),
      courseId,
      studentId,
      enrolledAt: new Date().toISOString(),
      enrolledBy: currentUser.id,
    };

    setEnrollments([...enrollments, enrollment]);

    // Inicializar progresso do aluno
    const course = courses.find(c => c.id === courseId);
    if (course && course.lessons.length > 0) {
      const lessonsProgress: LessonProgress[] = course.lessons.map((lesson, idx) => ({
        lessonId: lesson.id,
        courseId: course.id,
        studentId,
        status: idx === 0 ? 'available' : 'locked',
      }));

      const progress: CourseProgress = {
        courseId,
        studentId,
        lessonsProgress,
        currentLessonIndex: 0,
      };

      setCourseProgress([...courseProgress, progress]);
    }
  };

  const getEnrolledStudents = (courseId: string) => {
    const enrolledIds = enrollments
      .filter(e => e.courseId === courseId)
      .map(e => e.studentId);
    return students.filter(s => enrolledIds.includes(s.id));
  };

  const getCourseEnrollments = (courseId: string) => {
    return enrollments.filter(e => e.courseId === courseId);
  };

  // ===== FUNÇÕES DO ALUNO =====

  const submitExam = (
    examId: string,
    lessonId: string,
    courseId: string,
    answers: StudentAnswer[]
  ) => {
    if (!currentUser || currentUser.role !== 'aluno') return;

    const submission: ExamSubmission = {
      id: Date.now().toString(),
      examId,
      studentId: currentUser.id,
      lessonId,
      courseId,
      answers,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    setSubmissions([...submissions, submission]);
  };

  const getStudentProgress = (studentId: string, courseId: string) => {
    return courseProgress.find(p => p.studentId === studentId && p.courseId === courseId);
  };

  const canAccessLesson = (studentId: string, courseId: string, lessonIndex: number) => {
    const progress = getStudentProgress(studentId, courseId);
    
    // Se não há progresso, só pode acessar a primeira aula
    if (!progress) {
      return lessonIndex === 0;
    }

    const lessonProgress = progress.lessonsProgress[lessonIndex];
    return lessonProgress?.status === 'available' || lessonProgress?.status === 'completed';
  };

  const value: CoursesContextType = {
    courses,
    exams,
    submissions,
    courseProgress,
    enrollments,
    students,
    createCourse,
    addLesson,
    createExam,
    approveSubmission,
    rejectSubmission,
    getPendingSubmissions,
    createStudent,
    enrollStudent,
    getEnrolledStudents,
    getCourseEnrollments,
    submitExam,
    getStudentProgress,
    canAccessLesson,
  };

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
};
