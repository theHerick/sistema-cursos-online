# 🚀 Deploy no Vercel

## Instruções para fazer deploy

### Opção 1: Deploy via Git (Recomendado)

1. **Criar repositório no GitHub:**
```bash
git init
git add .
git commit -m "Initial commit - Sistema de Cursos Online"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

2. **Fazer deploy no Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub
   - Clique em "Add New Project"
   - Selecione seu repositório
   - Clique em "Deploy"
   - Pronto! 🎉

### Opção 2: Deploy via CLI

1. **Instalar Vercel CLI:**
```bash
npm install -g vercel
```

2. **Fazer login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Deploy em produção:**
```bash
vercel --prod
```

## ⚙️ Configurações

O projeto já está configurado com:
- ✅ `vercel.json` - Configurações do Vercel
- ✅ Build otimizado com Vite
- ✅ SPA routing configurado
- ✅ LocalStorage para persistência de dados

## 📱 Depois do Deploy

Após o deploy, você terá:
- URL de produção (ex: `seu-projeto.vercel.app`)
- Deploy automático a cada push no GitHub
- Preview de branches
- Certificado SSL gratuito

## 💾 Importante sobre os Dados

⚠️ **Atenção:** Os dados são salvos no LocalStorage do navegador, então:
- Cada usuário terá seus próprios dados locais
- Os dados não são compartilhados entre dispositivos
- Se limpar o cache, os dados são perdidos

Para dados persistentes em produção, considere adicionar um backend futuramente.

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Guia Vite + Vercel](https://vercel.com/docs/frameworks/vite)
