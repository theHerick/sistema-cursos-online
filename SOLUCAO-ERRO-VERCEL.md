# ✅ SOLUÇÃO: Deploy via GitHub (Mais Fácil)

## 🎯 Passos Simples:

### 1. Criar Repositório no GitHub
- Acesse: https://github.com/new
- Nome: `sistema-cursos-online`
- Deixe público ou privado
- Clique em "Create repository"

### 2. Conectar e Enviar Código

Cole estes comandos no terminal (substitua SEU_USUARIO pelo seu usuário do GitHub):

```powershell
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/sistema-cursos-online.git
git push -u origin main
```

**Nota:** Se pedir login, use seu usuário e senha do GitHub (ou Personal Access Token)

### 3. Deploy no Vercel

1. Acesse: https://vercel.com
2. Faça login com **GitHub** (mesma conta que criou o repositório)
3. Clique em "Add New Project"
4. Selecione o repositório `sistema-cursos-online`
5. Clique em "Deploy"
6. Aguarde 1-2 minutos
7. **PRONTO!** 🎉

## 🔧 Alternativa: Corrigir Email Git

Se preferir usar CLI direta, configure o mesmo email da sua conta Vercel:

```powershell
git config user.email "SEU_EMAIL_DO_VERCEL@gmail.com"
vercel login
vercel --prod
```

**Mas a forma via GitHub é MUITO mais simples!** 😊
