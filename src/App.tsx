import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CoursesProvider } from './contexts/CoursesContext';
import Login from './components/Login';
import ProfessorDashboard from './components/ProfessorDashboard';
import StudentDashboard from './components/StudentDashboard';
import './App.css';

const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  if (currentUser?.role === 'professor') {
    return <ProfessorDashboard />;
  }

  return <StudentDashboard />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CoursesProvider>
        <AppContent />
      </CoursesProvider>
    </AuthProvider>
  );
};

export default App;
