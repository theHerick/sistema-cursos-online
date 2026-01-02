import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CoursesContext';
import { Course, Lesson } from '../types';
import './StudentDashboard.css';

const StudentDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { courses, getStudentProgress, canAccessLesson, enrollments } = useCourses();
  
  // Filtrar apenas cursos em que o aluno está matriculado
  const enrolledCourses = currentUser 
    ? courses.filter(course => 
        enrollments.some(e => e.courseId === course.id && e.studentId === currentUser.id)
      )
    : [];
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [viewMode, setViewMode] = useState<'courses' | 'lesson'>('courses');

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleSelectLesson = (lesson: Lesson, lessonIndex: number) => {
    if (!currentUser || !selectedCourse) return;
    
    if (canAccessLesson(currentUser.id, selectedCourse.id, lessonIndex)) {
      setSelectedLesson(lesson);
      setViewMode('lesson');
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedLesson(null);
    setViewMode('courses');
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setViewMode('courses');
  };

  const getLessonStatus = (courseId: string, lessonIndex: number) => {
    if (!currentUser) return 'locked';
    
    const progress = getStudentProgress(currentUser.id, courseId);
    
    if (!progress) {
      return lessonIndex === 0 ? 'available' : 'locked';
    }

    return progress.lessonsProgress[lessonIndex]?.status || 'locked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'available':
        return '⏳';
      case 'locked':
      default:
        return '🔒';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'available':
        return 'status-available';
      case 'locked':
      default:
        return 'status-locked';
    }
  };

  if (viewMode === 'lesson' && selectedLesson && selectedCourse) {
    return (
      <LessonView
        lesson={selectedLesson}
        course={selectedCourse}
        onBack={handleBackToLessons}
      />
    );
  }

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <h1>👨‍🎓 Dashboard do Aluno</h1>
        <div className="user-info">
          <span>Olá, {currentUser?.name}!</span>
          <button onClick={logout} className="logout-button">Sair</button>
        </div>
      </header>

      <div className="dashboard-content">
        {!selectedCourse ? (
          // Lista de Cursos
          <section className="section">
            <h2>Meus Cursos ({enrolledCourses.length})</h2>
            
            {enrolledCourses.length === 0 ? (
              <p className="empty-state">Você ainda não está matriculado em nenhum curso. Aguarde o professor vincular você a um curso.</p>
            ) : (
              <div className="courses-grid">
                {enrolledCourses.map(course => (
                  <div
                    key={course.id}
                    className="course-card clickable"
                    onClick={() => handleSelectCourse(course)}
                  >
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <p className="course-info">📚 {course.lessons.length} aulas</p>
                    
                    {currentUser && (
                      <div className="progress-info">
                        {(() => {
                          const progress = getStudentProgress(currentUser.id, course.id);
                          const completed = progress?.lessonsProgress.filter(
                            lp => lp.status === 'completed'
                          ).length || 0;
                          return (
                            <span>
                              Progresso: {completed}/{course.lessons.length} aulas
                            </span>
                          );
                        })()}
                      </div>
                    )}
                    
                    <button className="btn-primary">Ver Curso</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          // Detalhes do Curso e Lista de Aulas
          <section className="section">
            <button onClick={handleBackToCourses} className="back-button">
              ← Voltar para Cursos
            </button>
            
            <h2>{selectedCourse.title}</h2>
            <p className="course-description">{selectedCourse.description}</p>

            <h3>Aulas</h3>
            <div className="lessons-list-student">
              {selectedCourse.lessons.map((lesson, idx) => {
                const status = getLessonStatus(selectedCourse.id, idx);
                const canAccess = status === 'available' || status === 'completed';
                
                return (
                  <div
                    key={lesson.id}
                    className={`lesson-card-student ${getStatusClass(status)} ${
                      canAccess ? 'clickable' : 'disabled'
                    }`}
                    onClick={() => canAccess && handleSelectLesson(lesson, idx)}
                  >
                    <div className="lesson-header-student">
                      <span className="lesson-number">Aula {idx + 1}</span>
                      <span className={`status-badge ${getStatusClass(status)}`}>
                        {getStatusIcon(status)}{' '}
                        {status === 'completed'
                          ? 'Aprovado'
                          : status === 'available'
                          ? 'Disponível'
                          : 'Bloqueado'}
                      </span>
                    </div>
                    <h4>{lesson.title}</h4>
                    {canAccess && (
                      <button className="btn-secondary">Acessar Aula</button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Componente para visualizar aula e fazer prova
interface LessonViewProps {
  lesson: Lesson;
  course: Course;
  onBack: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, course, onBack }) => {
  const { currentUser } = useAuth();
  const { exams, submitExam, submissions } = useCourses();
  
  const [showExam, setShowExam] = useState(false);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});

  const exam = exams.find(e => e.id === lesson.examId);
  const hasSubmitted = submissions.some(
    s =>
      s.lessonId === lesson.id &&
      s.studentId === currentUser?.id &&
      s.status === 'pending'
  );

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmitExam = () => {
    if (!currentUser || !exam) return;

    const studentAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer,
    }));

    submitExam(exam.id, lesson.id, course.id, studentAnswers);
    setShowExam(false);
    alert('Prova enviada com sucesso! Aguarde a correção do professor.');
  };

  return (
    <div className="lesson-view">
      <header className="lesson-header">
        <button onClick={onBack} className="back-button">
          ← Voltar
        </button>
        <h2>{lesson.title}</h2>
        <p className="course-name">{course.title}</p>
      </header>

      <div className="lesson-content">
        {!showExam ? (
          <>
            <section className="section">
              <h3>📖 Material da Aula</h3>
              <div className="external-link-card">
                <p>Acesse o conteúdo da aula através do link abaixo:</p>
                <a
                  href={lesson.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  🔗 Abrir Material
                </a>
              </div>
            </section>

            {exam && (
              <section className="section">
                <h3>📝 Prova</h3>
                {hasSubmitted ? (
                  <div className="info-card">
                    <p>✓ Você já enviou sua prova!</p>
                    <p>Aguarde a correção do professor.</p>
                  </div>
                ) : (
                  <>
                    <p>Após estudar o material, faça a prova para avançar.</p>
                    <button onClick={() => setShowExam(true)} className="btn-primary">
                      Iniciar Prova
                    </button>
                  </>
                )}
              </section>
            )}
          </>
        ) : (
          <section className="section">
            <h3>📝 Prova - {lesson.title}</h3>
            
            {exam?.questions.map((question, idx) => (
              <div key={question.id} className="question-card-student">
                <h4>Questão {idx + 1}</h4>
                <p className="question-text">{question.text}</p>
                
                <div className="options-list-student">
                  {question.options.map((option, optIdx) => (
                    <label key={optIdx} className="option-label">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={answers[question.id] === optIdx}
                        onChange={() => handleAnswerChange(question.id, optIdx)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="exam-actions">
              <button
                onClick={handleSubmitExam}
                className="btn-primary"
                disabled={Object.keys(answers).length !== exam?.questions.length}
              >
                Enviar Prova
              </button>
              <button onClick={() => setShowExam(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
