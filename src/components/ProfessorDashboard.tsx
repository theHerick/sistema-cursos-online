import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourses } from '../contexts/CoursesContext';
import { Question } from '../types';
import './ProfessorDashboard.css';

const ProfessorDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const {
    courses,
    exams,
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
  } = useCourses();

  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showEnrollStudent, setShowEnrollStudent] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<string>('');

  // Form states
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonLink, setLessonLink] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [studentName, setStudentName] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const myCourses = courses.filter(c => c.professorId === currentUser?.id);
  const pendingSubmissions = currentUser ? getPendingSubmissions(currentUser.id) : [];

  const handleCreateCourse = () => {
    if (courseTitle && courseDescription) {
      createCourse(courseTitle, courseDescription);
      setCourseTitle('');
      setCourseDescription('');
      setShowCreateCourse(false);
    }
  };

  const handleAddLesson = () => {
    if (selectedCourseId && lessonTitle && lessonLink) {
      addLesson(selectedCourseId, lessonTitle, lessonLink);
      setLessonTitle('');
      setLessonLink('');
      setShowAddLesson(false);
    }
  };

  const handleCreateExam = () => {
    if (selectedLessonId && questions.length > 0) {
      createExam(selectedLessonId, questions);
      setQuestions([]);
      setShowCreateExam(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateStudent = () => {
    if (studentName) {
      createStudent(studentName);
      setStudentName('');
      setShowCreateStudent(false);
    }
  };

  const handleEnrollStudent = () => {
    if (selectedStudentId && selectedCourseForEnroll) {
      enrollStudent(selectedStudentId, selectedCourseForEnroll);
      setSelectedStudentId('');
      setShowEnrollStudent(false);
    }
  };

  return (
    <div className="professor-dashboard">
      <header className="dashboard-header">
        <h1>👨‍🏫 Dashboard do Professor</h1>
        <div className="user-info">
          <span>Olá, {currentUser?.name}!</span>
          <button onClick={logout} className="logout-button">Sair</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Seção de Alunos */}
        <section className="section">
          <div className="section-header">
            <h2>Alunos Cadastrados ({students.length})</h2>
            <button onClick={() => setShowCreateStudent(!showCreateStudent)} className="btn-primary">
              + Criar Aluno
            </button>
          </div>

          {showCreateStudent && (
            <div className="form-card">
              <h3>Novo Aluno</h3>
              <input
                type="text"
                placeholder="Nome do aluno"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <div className="form-actions">
                <button onClick={handleCreateStudent} className="btn-primary">Criar</button>
                <button onClick={() => setShowCreateStudent(false)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="students-grid">
            {students.map(student => (
              <div key={student.id} className="student-card">
                <h4>👨‍🎓 {student.name}</h4>
                <p className="student-email">{student.email}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Seção de Cursos */}
        <section className="section">
          <div className="section-header">
            <h2>Meus Cursos ({myCourses.length})</h2>
            <button onClick={() => setShowCreateCourse(!showCreateCourse)} className="btn-primary">
              + Criar Curso
            </button>
          </div>

          {showCreateCourse && (
            <div className="form-card">
              <h3>Novo Curso</h3>
              <input
                type="text"
                placeholder="Título do curso"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
              <textarea
                placeholder="Descrição do curso"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                rows={3}
              />
              <div className="form-actions">
                <button onClick={handleCreateCourse} className="btn-primary">Criar</button>
                <button onClick={() => setShowCreateCourse(false)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="courses-grid">
            {myCourses.map(course => (
              <div key={course.id} className="course-card">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <p className="course-info">📚 {course.lessons.length} aulas</p>
                <p className="course-info">👨‍🎓 {getEnrolledStudents(course.id).length} alunos</p>
                <div className="course-actions">
                  <button
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setShowAddLesson(true);
                    }}
                    className="btn-secondary"
                  >
                    + Adicionar Aula
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseForEnroll(course.id);
                      setShowEnrollStudent(true);
                    }}
                    className="btn-secondary"
                  >
                    + Vincular Aluno
                  </button>
                </div>

                {course.lessons.length > 0 && (
                  <div className="lessons-list">
                    <h4>Aulas:</h4>
                    {course.lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="lesson-item">
                        <span>
                          {idx + 1}. {lesson.title}
                        </span>
                        {!lesson.examId && (
                          <button
                            onClick={() => {
                              setSelectedLessonId(lesson.id);
                              setShowCreateExam(true);
                            }}
                            className="btn-small"
                          >
                            + Prova
                          </button>
                        )}
                        {lesson.examId && <span className="badge">✓ Prova criada</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Modal Adicionar Aula */}
        {showAddLesson && (
          <div className="modal-overlay" onClick={() => setShowAddLesson(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Adicionar Nova Aula</h3>
              <input
                type="text"
                placeholder="Título da aula"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
              <input
                type="url"
                placeholder="Link externo (YouTube, Google Docs, etc)"
                value={lessonLink}
                onChange={(e) => setLessonLink(e.target.value)}
              />
              <div className="form-actions">
                <button onClick={handleAddLesson} className="btn-primary">Adicionar</button>
                <button onClick={() => setShowAddLesson(false)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Vincular Aluno */}
        {showEnrollStudent && (
          <div className="modal-overlay" onClick={() => setShowEnrollStudent(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Vincular Aluno ao Curso</h3>
              <p className="modal-subtitle">
                Curso: {courses.find(c => c.id === selectedCourseForEnroll)?.title}
              </p>
              
              <label>Selecione o aluno:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="student-select"
              >
                <option value="">-- Selecione um aluno --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>

              {selectedCourseForEnroll && (
                <div className="enrolled-list">
                  <h4>Alunos já matriculados:</h4>
                  {getEnrolledStudents(selectedCourseForEnroll).map(student => (
                    <div key={student.id} className="enrolled-item">
                      ✓ {student.name}
                    </div>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <button
                  onClick={handleEnrollStudent}
                  className="btn-primary"
                  disabled={!selectedStudentId}
                >
                  Vincular
                </button>
                <button onClick={() => setShowEnrollStudent(false)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Criar Prova */}
        {showCreateExam && (
          <div className="modal-overlay" onClick={() => setShowCreateExam(false)}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <h3>Criar Prova</h3>
              
              {questions.map((q, qIdx) => (
                <div key={q.id} className="question-card">
                  <div className="question-header">
                    <h4>Questão {qIdx + 1}</h4>
                    <button onClick={() => removeQuestion(qIdx)} className="btn-danger-small">
                      ✕
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Texto da questão"
                    value={q.text}
                    onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                  />
                  
                  <div className="options-list">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="option-item">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctAnswer === optIdx}
                          onChange={() => updateQuestion(qIdx, 'correctAnswer', optIdx)}
                        />
                        <input
                          type="text"
                          placeholder={`Opção ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                        />
                        <span className="correct-label">
                          {q.correctAnswer === optIdx && '✓ Correta'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button onClick={addQuestion} className="btn-secondary">
                + Adicionar Questão
              </button>

              <div className="form-actions">
                <button
                  onClick={handleCreateExam}
                  className="btn-primary"
                  disabled={questions.length === 0}
                >
                  Criar Prova
                </button>
                <button onClick={() => setShowCreateExam(false)} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Submissões Pendentes */}
        <section className="section">
          <h2>Provas Pendentes ({pendingSubmissions.length})</h2>
          
          {pendingSubmissions.length === 0 ? (
            <p className="empty-state">Nenhuma prova pendente no momento.</p>
          ) : (
            <div className="submissions-list">
              {pendingSubmissions.map(submission => {
                const course = courses.find(c => c.id === submission.courseId);
                const lesson = course?.lessons.find(l => l.id === submission.lessonId);
                const exam = exams.find(e => e.id === submission.examId);

                return (
                  <div key={submission.id} className="submission-card">
                    <h4>{course?.title} - {lesson?.title}</h4>
                    <p>Aluno ID: {submission.studentId}</p>
                    <p className="submission-date">
                      Enviado em: {new Date(submission.submittedAt).toLocaleString('pt-BR')}
                    </p>
                    
                    <div className="exam-review">
                      {exam?.questions.map((question, idx) => {
                        const studentAnswer = submission.answers.find(a => a.questionId === question.id);
                        const isCorrect = studentAnswer?.selectedAnswer === question.correctAnswer;
                        
                        return (
                          <div key={question.id} className="review-question">
                            <p><strong>Q{idx + 1}:</strong> {question.text}</p>
                            <p className={isCorrect ? 'correct' : 'incorrect'}>
                              Resposta do aluno: {question.options[studentAnswer?.selectedAnswer || 0]}
                              {isCorrect ? ' ✓' : ' ✗'}
                            </p>
                            {!isCorrect && (
                              <p className="correct-answer">
                                Resposta correta: {question.options[question.correctAnswer]}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="submission-actions">
                      <button
                        onClick={() => approveSubmission(submission.id)}
                        className="btn-success"
                      >
                        ✓ Aprovar
                      </button>
                      <button
                        onClick={() => rejectSubmission(submission.id)}
                        className="btn-danger"
                      >
                        ✗ Reprovar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
