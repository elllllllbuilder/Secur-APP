# 🚗 Secur APP - Sistema de Assistência para Motoristas

Sistema completo de assistência 24h para motoristas com app mobile, backend e painel administrativo.

---

## 📋 Visão Geral

**Secur APP** é uma plataforma completa que oferece:
- 🏥 Assistência médica emergencial
- 🔧 Guincho e pane mecânica
- 🚗 Suporte em acidentes
- 🚨 Auxílio em casos de roubo/furto
- 📄 Gestão de documentos
- 💳 Sistema de assinaturas

---

## 🏗️ Arquitetura

### Backend (NestJS + PostgreSQL)
- **Localização:** `/backend`
- **Porta:** 3333
- **Banco:** PostgreSQL (Neon)
- **Autenticação:** JWT
- **Upload:** Multer (local storage)

### Frontend Mobile (React Native + Expo)
- **Localização:** `/frontend`
- **Framework:** Expo + React Native
- **Navegação:** Expo Router
- **Estado:** React Query + Zustand

### Painel Admin (React + Vite)
- **Localização:** `/doc-review-dashboard`
- **Porta:** 5173
- **Framework:** React + TypeScript

---

## 🚀 Início Rápido

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Edite o .env com suas credenciais

# Rodar migrações
npx prisma migrate dev

# Criar dados iniciais
npx ts-node scripts/create-admin.ts
npx ts-node scripts/seed-plans.ts
npx ts-node scripts/seed-categories-simple.ts

# Iniciar servidor
npm run start:dev
```

**Backend rodando em:** `http://localhost:3333`

### 2. Frontend Mobile

```bash
cd frontend

# Instalar dependências
npm install

# Configurar .env
echo "EXPO_PUBLIC_API_URL=http://SEU_IP:3333" > .env

# Iniciar app
npx expo start
```

### 3. Painel Admin

```bash
cd doc-review-dashboard

# Instalar dependências
npm install

# Iniciar painel
npm run dev
```

**Painel rodando em:** `http://localhost:5173`

**Credenciais Admin:**
- Email: `admin@securapp.com`
- Senha: `Admin@123`

---

## 📦 Funcionalidades

### ✅ Autenticação
- Login/Registro com JWT
- Refresh tokens
- Proteção de rotas
- Validação de CPF

### ✅ Gestão de Usuários
- Perfil completo
- Seleção de categoria (Motorista App, Taxista, etc.)
- Documentos obrigatórios por categoria
- Histórico de atividades

### ✅ Upload de Documentos
- Upload via câmera ou galeria
- Múltiplos formatos (PDF, JPG, PNG)
- Aprovação/Rejeição pelo admin
- Notificações de status
- Cards coloridos (verde=aprovado, vermelho=rejeitado)

### ✅ Sistema de Suporte
- 4 tipos de apoio (Médico, Pane, Acidente, Roubo)
- Chat em tempo real
- Anexos de fotos
- Status do ticket (Aberto, Em Andamento, Resolvido)
- Notificações automáticas

### ✅ Notificações In-App
- Notificações de documentos
- Notificações de suporte
- Mensagens do admin
- Delete ao tocar
- Badge de não lidas

### ✅ Planos e Assinaturas
- 3 planos (Bronze, Prata, Ouro)
- Integração Mercado Pago
- Pagamento PIX e Cartão
- Renovação automática

### ✅ Painel Administrativo
- Dashboard com estatísticas
- Gestão de usuários
- Aprovação de documentos
- Gerenciamento de tickets
- Envio de notificações
- WhatsApp direto
- Mudança de status

---

## 🗄️ Banco de Dados

### Principais Modelos

- **User** - Usuários do sistema
- **Category** - Categorias de motoristas
- **RequiredDoc** - Documentos obrigatórios
- **UserDocument** - Documentos enviados
- **Plan** - Planos de assinatura
- **Subscription** - Assinaturas ativas
- **SupportTicket** - Tickets de suporte
- **TicketMessage** - Mensagens do chat
- **Notification** - Notificações in-app
- **Payment** - Histórico de pagamentos

---

## 🔧 Configuração

### Variáveis de Ambiente

**Backend (.env):**
```env
DATABASE_URL="postgresql://..."
PORT=3333
JWT_SECRET=supersecret
JWT_REFRESH_SECRET=anothersecret
FRONTEND_ORIGIN=http://192.168.1.6:8081,exp://192.168.1.6:8081
PUBLIC_URL=http://192.168.1.6:3333
MERCADOPAGO_ACCESS_TOKEN=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

**Frontend (.env):**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.6:3333
```

---

## 📱 Endpoints Principais

### Autenticação
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Usuário
- `GET /me` - Perfil
- `PATCH /me/profile` - Atualizar perfil
- `GET /me/documents` - Listar documentos
- `POST /me/documents` - Upload documento
- `DELETE /me/documents/:id` - Deletar documento

### Suporte
- `GET /support/tickets` - Listar tickets
- `POST /support/tickets` - Criar ticket
- `GET /support/tickets/:id` - Detalhes
- `GET /support/tickets/:id/messages` - Mensagens
- `POST /support/tickets/:id/messages` - Enviar mensagem

### Notificações
- `GET /notifications/me` - Listar notificações
- `DELETE /notifications/:id` - Deletar notificação
- `DELETE /notifications/all` - Deletar todas

### Admin
- `GET /admin/users` - Listar usuários
- `GET /admin/documents` - Listar documentos
- `PATCH /admin/documents/:id/approve` - Aprovar
- `PATCH /admin/documents/:id/reject` - Rejeitar
- `GET /admin/support/tickets` - Listar tickets
- `PATCH /admin/support/tickets/:id/status` - Mudar status
- `POST /admin/users/:id/notify` - Notificar usuário

---

## 🎨 Tecnologias

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- JWT
- Multer
- Mercado Pago SDK

### Frontend
- React Native
- Expo
- Expo Router
- React Query
- Zustand
- Axios

### Admin
- React
- TypeScript
- Vite
- Axios

---

## 📝 Scripts Úteis

### Backend
```bash
# Criar admin
npx ts-node scripts/create-admin.ts

# Seed de planos
npx ts-node scripts/seed-plans.ts

# Seed de categorias
npx ts-node scripts/seed-categories-simple.ts

# Limpar usuários de teste
npx ts-node scripts/clear-test-users.ts

# Gerar Prisma Client
npx prisma generate

# Rodar migração
npx prisma migrate dev
```

### Frontend
```bash
# Limpar cache
npx expo start --clear

# Build Android
npx expo build:android

# Build iOS
npx expo build:ios
```

---

## 🐛 Troubleshooting

### Backend não conecta
1. Verifique se está rodando: `http://localhost:3333/health`
2. Confira DATABASE_URL no .env
3. Rode as migrações: `npx prisma migrate dev`

### App não conecta ao backend
1. Use o IP da máquina, não localhost
2. Celular e PC devem estar na mesma WiFi
3. Verifique CORS no backend (.env FRONTEND_ORIGIN)
4. Desative firewall temporariamente para testar

### Upload não funciona
1. Verifique permissões de câmera/galeria
2. Confirme que pasta /uploads existe
3. Limite de 20MB por arquivo
4. Use fetch() ao invés de axios para FormData

### Notificações não aparecem
1. Verifique se backend criou a notificação (logs)
2. Confirme unwrap duplo: `res.data?.data?.data`
3. Recarregue a tela de notificações

---

## 📄 Licença

Propriedade de Secur APP - Todos os direitos reservados

---

## 👥 Suporte

Para dúvidas ou problemas:
- Email: suporte@securapp.com
- WhatsApp: (11) 99999-9999
