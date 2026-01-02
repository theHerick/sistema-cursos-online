# Sistema de Gerenciamento de Cursos Online

Sistema completo de gerenciamento de cursos online desenvolvido em React com TypeScript.

## 📚 Funcionalidades

### 👨‍🏫 Professor
- Criar cursos com título e descrição
- Adicionar aulas com links externos (YouTube, Google Docs, etc.)
- Criar provas com questões de múltipla escolha
- Corrigir e aprovar/reprovar alunos
- Visualizar dashboard com todos os cursos criados
- Ver provas pendentes de correção

### 👨‍🎓 Aluno
- Ver lista de cursos disponíveis
- Acessar aulas através de links externos
- Fazer provas após estudar o material
- Sistema de progresso sequencial (só avança após aprovação)
- Visualizar status das aulas:
  - ✓ **Aprovado** - Aula concluída
  - ⏳ **Disponível** - Pode acessar agora
  - 🔒 **Bloqueado** - Precisa completar aulas anteriores

## 🚀 Como Executar

1. **Instalar dependências:**
```bash
npm install
```

2. **Executar em modo de desenvolvimento:**
```bash
npm run dev
```

3. **Abrir no navegador:**
O sistema estará disponível em `http://localhost:5173`

4. **Build para produção:**
```bash
npm run build
```

## 🛠️ Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Context API** - Gerenciamento de estado global
- **LocalStorage** - Persistência de dados
- **CSS3** - Estilização com design moderno

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── Login.tsx              # Tela de login
│   ├── Login.css
│   ├── ProfessorDashboard.tsx # Dashboard do professor
│   ├── ProfessorDashboard.css
│   ├── StudentDashboard.tsx   # Dashboard do aluno
│   └── StudentDashboard.css
├── contexts/
│   ├── AuthContext.tsx        # Autenticação
│   └── CoursesContext.tsx     # Gerenciamento de cursos
├── types/
│   └── index.ts               # Definições TypeScript
├── App.tsx                    # Componente principal
├── App.css                    # Estilos globais
└── main.tsx                   # Entry point
```

## 🔄 Fluxo do Sistema

1. **Login** - Usuário escolhe entre Professor ou Aluno
2. **Professor cria curso** - Ex: "Curso de Informática Básica"
3. **Professor adiciona aulas** - Com links para conteúdo externo
4. **Professor cria provas** - Questões de múltipla escolha
5. **Aluno acessa curso** - Vê lista de aulas
6. **Aluno estuda** - Acessa link externo da aula
7. **Aluno faz prova** - Responde questões
8. **Professor corrige** - Aprova ou reprova
9. **Próxima aula desbloqueada** - Aluno pode continuar

## 💾 Persistência de Dados

Todos os dados são armazenados no LocalStorage:
- Usuários
- Cursos e aulas
- Provas e questões
- Submissões de provas
- Progresso dos alunos

## 🎨 Design

Interface moderna com:
- Gradiente roxo no fundo
- Cards brancos com sombras
- Botões com hover effects
- Sistema de cores intuitivo
- Design responsivo para mobile

## 📝 Exemplo de Uso

### Como Professor:
1. Faça login como Professor
2. Clique em "+ Criar Curso"
3. Preencha título e descrição
4. Clique em "+ Adicionar Aula"
5. Insira título e link externo
6. Clique em "+ Prova" para criar questões
7. Adicione questões com 4 opções
8. Marque a resposta correta
9. Aguarde alunos enviarem provas
10. Aprove ou reprove na seção "Provas Pendentes"

### Como Aluno:
1. Faça login como Aluno
2. Veja cursos disponíveis
3. Clique em um curso para ver aulas
4. Acesse a primeira aula (disponível por padrão)
5. Clique em "Abrir Material" para estudar
6. Clique em "Iniciar Prova"
7. Responda todas as questões
8. Clique em "Enviar Prova"
9. Aguarde aprovação do professor
10. Próxima aula será desbloqueada após aprovação

## 📄 Licença

Este é um projeto educacional livre para uso e modificação.
