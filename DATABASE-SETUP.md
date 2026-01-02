# 🗄️ Configuração do Banco de Dados Vercel Postgres

## 📋 Passo a Passo

### 1️⃣ Criar Banco de Dados no Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto `sistema-cursos-online`
3. Vá em **Storage** (menu lateral)
4. Clique em **Create Database**
5. Selecione **Postgres**
6. Escolha a região mais próxima (ex: Washington D.C.)
7. Clique em **Create**

### 2️⃣ Conectar ao Projeto

1. Após criar, clique em **Connect**
2. Selecione seu projeto
3. Marque todas as opções de variáveis de ambiente
4. Clique em **Connect**

### 3️⃣ Executar Schema do Banco

1. No painel do banco, vá em **Query**
2. Copie todo o conteúdo do arquivo `schema.sql`
3. Cole na query e clique em **Run Query**
4. Aguarde confirmação ✅

**OU via CLI:**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Link ao projeto
vercel link

# Executar o schema
vercel env pull .env.local
psql $POSTGRES_URL -f schema.sql
```

### 4️⃣ Fazer Deploy

Agora basta fazer o deploy normalmente:

```bash
git add .
git commit -m "Adicionar backend com Vercel Postgres"
git push
```

O Vercel fará deploy automático! 🚀

### 5️⃣ Testar APIs

Após o deploy, suas APIs estarão disponíveis em:

- `https://seu-projeto.vercel.app/api/auth`
- `https://seu-projeto.vercel.app/api/courses`
- `https://seu-projeto.vercel.app/api/lessons`
- `https://seu-projeto.vercel.app/api/exams`
- `https://seu-projeto.vercel.app/api/enrollments`
- `https://seu-projeto.vercel.app/api/submissions`
- `https://seu-projeto.vercel.app/api/progress`

## 📊 Estrutura do Banco

### Tabelas Criadas:

- **users** - Professores e alunos
- **courses** - Cursos criados
- **lessons** - Aulas dos cursos
- **exams** - Provas das aulas
- **questions** - Questões das provas
- **enrollments** - Matrículas (vínculos aluno-curso)
- **exam_submissions** - Submissões de provas
- **student_answers** - Respostas dos alunos
- **lesson_progress** - Progresso dos alunos nas aulas

## 🔄 Migração Automática

Todos os dados que estavam no localStorage agora serão salvos no banco de dados Postgres da Vercel!

### O que mudou:

✅ Dados persistentes em nuvem
✅ Compartilhados entre dispositivos
✅ Backup automático
✅ Escalável
✅ Seguro

## ⚠️ Importante

- As variáveis de ambiente são configuradas automaticamente pela Vercel
- Não commite arquivos `.env` no Git (já está no .gitignore)
- O plano gratuito tem limites, mas é suficiente para testes

## 🆘 Problemas Comuns

### "Cannot connect to database"
- Verifique se conectou o banco ao projeto
- Vá em Settings → Environment Variables e confirme que `POSTGRES_URL` existe

### "Table does not exist"
- Execute o schema.sql no painel Query do banco

### APIs retornam 500
- Verifique os logs em: https://vercel.com/dashboard → seu projeto → Logs

## 📚 Documentação

- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Functions](https://vercel.com/docs/functions/serverless-functions)
