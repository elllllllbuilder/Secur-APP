# 🚀 Guia de Deploy para Produção

## 📋 Índice
1. [Backend - Hospedagem](#backend)
2. [App Mobile - Build e Publicação](#app-mobile)
3. [Dashboard Admin - Hospedagem](#dashboard-admin)
4. [Configurações Finais](#configuracoes-finais)

---

## 🖥️ BACKEND

### Opção 1: Railway (Recomendado - Mais Fácil)

#### Passo 1: Criar conta
1. Acesse: https://railway.app
2. Faça login com GitHub

#### Passo 2: Deploy do Backend
```bash
# No diretório do projeto
cd backend

# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Criar novo projeto
railway init

# Adicionar PostgreSQL
railway add

# Fazer deploy
railway up
```

#### Passo 3: Configurar Variáveis de Ambiente
No painel do Railway, adicione:
```env
DATABASE_URL=postgresql://...  # Gerado automaticamente
NODE_ENV=production
JWT_SECRET=seu_secret_super_seguro_aqui
MERCADOPAGO_ACCESS_TOKEN=seu_token_producao
FRONTEND_URL=https://seu-app.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu@email.com
EMAIL_PASS=sua_senha_app
```

#### Passo 4: Rodar Migrations
```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

**URL do Backend:** `https://seu-projeto.up.railway.app`

---

### Opção 2: Render.com (Alternativa Gratuita)

#### Passo 1: Criar conta
1. Acesse: https://render.com
2. Conecte com GitHub

#### Passo 2: Criar PostgreSQL
1. New → PostgreSQL
2. Nome: `secur-db`
3. Copie a `Internal Database URL`

#### Passo 3: Criar Web Service
1. New → Web Service
2. Conecte seu repositório
3. Configurações:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Environment:** Node

#### Passo 4: Variáveis de Ambiente
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
JWT_SECRET=seu_secret_aqui
MERCADOPAGO_ACCESS_TOKEN=seu_token
FRONTEND_URL=https://seu-app.com
```

**URL do Backend:** `https://seu-projeto.onrender.com`

---

### Opção 3: VPS (DigitalOcean, AWS, etc)

#### Requisitos
- Ubuntu 22.04
- Node.js 18+
- PostgreSQL 14+
- Nginx

#### Script de Deploy
```bash
# Conectar ao servidor
ssh root@seu-servidor.com

# Instalar dependências
apt update
apt install -y nodejs npm postgresql nginx

# Clonar projeto
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo/backend

# Instalar dependências
npm install

# Configurar .env
nano .env
# Cole as variáveis de ambiente

# Rodar migrations
npx prisma migrate deploy

# Build
npm run build

# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start dist/main.js --name secur-backend
pm2 startup
pm2 save

# Configurar Nginx
nano /etc/nginx/sites-available/secur
```

**Configuração Nginx:**
```nginx
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
ln -s /etc/nginx/sites-available/secur /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL com Let's Encrypt
apt install certbot python3-certbot-nginx
certbot --nginx -d api.seu-dominio.com
```

---

## 📱 APP MOBILE

### Build para Android

#### Passo 1: Configurar EAS
```bash
cd frontend

# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar projeto
eas build:configure
```

#### Passo 2: Configurar app.json
```json
{
  "expo": {
    "name": "UFAe",
    "slug": "ufae-app",
    "version": "1.0.0",
    "android": {
      "package": "com.ufae.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#00a9ff"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "seu-project-id"
      }
    }
  }
}
```

#### Passo 3: Configurar Variáveis de Ambiente
Crie `frontend/.env.production`:
```env
EXPO_PUBLIC_API_URL=https://api.seu-dominio.com
```

#### Passo 4: Build APK (Teste)
```bash
# Build APK para teste
eas build --platform android --profile preview

# Aguarde o build (15-30 min)
# Download do APK será disponibilizado
```

#### Passo 5: Build AAB (Google Play)
```bash
# Build para produção
eas build --platform android --profile production

# Aguarde o build
# Download do AAB para upload na Play Store
```

#### Passo 6: Publicar na Google Play Store
1. Acesse: https://play.google.com/console
2. Criar novo app
3. Preencher informações:
   - Nome: UFAe
   - Descrição
   - Screenshots (mínimo 2)
   - Ícone (512x512px)
4. Upload do AAB
5. Configurar preço (gratuito)
6. Enviar para revisão

---

### Build para iOS

#### Requisitos
- Conta Apple Developer ($99/ano)
- Mac com Xcode (para certificados)

#### Passo 1: Configurar app.json
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.ufae.app",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    }
  }
}
```

#### Passo 2: Build
```bash
# Build para TestFlight
eas build --platform ios --profile production

# Aguarde o build (20-40 min)
```

#### Passo 3: Publicar na App Store
1. Acesse: https://appstoreconnect.apple.com
2. Criar novo app
3. Upload do build via Xcode ou Transporter
4. Preencher informações
5. Enviar para revisão

---

## 🌐 DASHBOARD ADMIN

### Opção 1: Vercel (Recomendado)

```bash
cd doc-review-dashboard

# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no painel
# VITE_API_URL=https://api.seu-dominio.com
```

**URL:** `https://seu-dashboard.vercel.app`

---

### Opção 2: Netlify

```bash
cd doc-review-dashboard

# Build
npm run build

# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## ⚙️ CONFIGURAÇÕES FINAIS

### 1. Mercado Pago - Webhook

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Vá em "Webhooks"
3. Adicione:
   - **URL:** `https://api.seu-dominio.com/webhooks/mercadopago`
   - **Eventos:** `payment`, `subscription`

### 2. Configurar Domínio

#### Backend
```bash
# No seu provedor de DNS (Cloudflare, etc)
# Adicione registro A ou CNAME:
api.seu-dominio.com → IP do servidor
```

#### App
```bash
# Atualizar variável de ambiente
EXPO_PUBLIC_API_URL=https://api.seu-dominio.com

# Rebuild do app
eas build --platform android --profile production
```

### 3. Monitoramento

#### Logs do Backend
```bash
# Railway
railway logs

# Render
# Ver logs no painel

# VPS com PM2
pm2 logs secur-backend
pm2 monit
```

#### Sentry (Opcional - Rastreamento de Erros)
```bash
npm install @sentry/node

# Adicionar no main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'seu-dsn-aqui',
  environment: 'production',
});
```

---

## 📊 CHECKLIST FINAL

### Backend
- [ ] Deploy realizado
- [ ] Migrations rodadas
- [ ] Variáveis de ambiente configuradas
- [ ] Webhook do Mercado Pago configurado
- [ ] SSL/HTTPS ativo
- [ ] Logs funcionando

### App Mobile
- [ ] Build APK/AAB gerado
- [ ] Variável API_URL apontando para produção
- [ ] Testado em dispositivo real
- [ ] Publicado na Play Store
- [ ] (Opcional) Publicado na App Store

### Dashboard
- [ ] Deploy realizado
- [ ] Variável API_URL configurada
- [ ] Acesso admin funcionando
- [ ] HTTPS ativo

### Geral
- [ ] Domínio configurado
- [ ] Email de confirmação funcionando
- [ ] Push notifications funcionando
- [ ] Pagamentos testados (PIX e Cartão)
- [ ] Backup do banco configurado

---

## 🆘 SUPORTE

### Problemas Comuns

**1. App não conecta ao backend**
- Verifique `EXPO_PUBLIC_API_URL`
- Teste a URL no navegador
- Verifique CORS no backend

**2. Webhook não funciona**
- Verifique URL no painel do MP
- Teste manualmente com curl
- Veja logs do backend

**3. Build falha**
- Limpe cache: `eas build:clean`
- Verifique app.json
- Veja logs do build

### Links Úteis
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- EAS Build: https://docs.expo.dev/build/introduction
- Mercado Pago: https://www.mercadopago.com.br/developers

---

## 💰 Custos Estimados

### Gratuito
- Backend: Railway (500h/mês) ou Render
- Dashboard: Vercel ou Netlify
- Banco: Neon PostgreSQL (500MB)

### Pago
- Google Play: $25 (uma vez)
- Apple Developer: $99/ano
- VPS: $5-20/mês (DigitalOcean, Vultr)
- Domínio: $10-15/ano

---

**Boa sorte com o deploy! 🚀**
