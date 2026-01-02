import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'professor' | 'aluno'>('aluno');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      login(name, role);
    }
  };

  const handleQuickLogin = () => {
    login('Herick', 'professor');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📚 Sistema de Cursos Online</h1>
        <p className="subtitle">Bem-vindo! Faça login para continuar</p>
        
        <button onClick={handleQuickLogin} className="quick-login-button">
          👨‍🏫 Login Rápido - Professor Herick
        </button>
        
        <div className="divider">
          <span>OU</span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Usuário:</label>
            <div className="role-selection">
              <label className={`role-option ${role === 'aluno' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="aluno"
                  checked={role === 'aluno'}
                  onChange={() => setRole('aluno')}
                />
                <span className="role-icon">👨‍🎓</span>
                <span>Aluno</span>
              </label>

              <label className={`role-option ${role === 'professor' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="professor"
                  checked={role === 'professor'}
                  onChange={() => setRole('professor')}
                />
                <span className="role-icon">👨‍🏫</span>
                <span>Professor</span>
              </label>
            </div>
          </div>

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
