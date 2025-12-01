# 🎛️ GUIA DE USO - PAINEL ADMIN SECUR APP

## 📋 ÍNDICE
1. [Como Acessar](#como-acessar)
2. [Funcionalidades](#funcionalidades)
3. [Guia Passo a Passo](#guia-passo-a-passo)
4. [Troubleshooting](#troubleshooting)

---

## 🚀 COMO ACESSAR

### 1. Iniciar o Backend
```bash
cd backend
npm run start:dev
```
O backend estará rodando em: `http://localhost:3333`

### 2. Iniciar o Painel Admin
```bash
cd doc-review-dashboard
npm install  # Primeira vez apenas
npm run dev
```
O painel estará disponível em: `http://localhost:5173`

### 3. Fazer Login
- Use suas credenciais de administrador
- Email e senha cadastrados no sistema
- O token JWT será armazenado automaticamente

---

## 🎯 FUNCIONALIDADES

### 📊 Dashboard
**O que você vê:**
- Total de usuários cadastrados
- Assinaturas ativas no momento
- Receita total gerada
- Pagamentos pendentes

**Ações disponíveis:**
- Botão para enviar push notification para todos

### 👥 Gestão de Usuários
**O que você pode fazer:**
- Ver lista completa de usuários
- Buscar por nome, email ou CPF
- Ver status da assinatura (Ativo/Inativo)
- Abrir WhatsApp direto do painel
- Editar dados do usuário
- Cancelar assinatura de um usuário
- Deletar usuário do sistema

### 💳 Gestão de Pagamentos
**O que você vê:**
- Lista de todos os pagamentos
- Nome e email do usuário
- Método de pagamento (PIX, Cartão)
- Valor do pagamento
- Status (Aprovado, Pendente, Rejeitado)
- Data do pagamento

### ⛽ Gestão de Postos
**O que você pode fazer:**
- Ver todos os postos cadastrados
- Ver localização (latitude/longitude)
- Ver se tem carregador elétrico
- Deletar postos

### 🔔 Push Notifications
**Enviar notificações para:**
- Todos os usuários
- Apenas usuários com plano ativo
- Apenas usuários sem plano (marketing)

**Campos:**
- Título da notificação
- Mensagem

### 📝 Gestão de Conteúdo
**Funcionalidades:**
- Upload de banners
- Editar termos de uso
- Gerenciar FAQ

### ⚙️ Configurações
**O que você pode configurar:**
- Nome do app
- Email de suporte
- Telefone de suporte
- Credenciais do Mercado Pago

---

## 📖 GUIA PASSO A PASSO

### Como Enviar uma Push Notification

1. Clique em "🔔 Push Notifications" no menu lateral
2. Selecione o público-alvo:
   - "Todos os usuários" - envia para todo mundo
   - "Usuários com plano ativo" - apenas assinantes
   - "Usuários sem plano" - para campanhas de marketing
3. Digite o título (ex: "Promoção Especial!")
4. Digite a mensagem (ex: "50% de desconto no plano anual")
5. Clique em "Enviar Notificação"
6. Aguarde a confirmação

### Como Gerenciar um Usuário

1. Clique em "👥 Usuários" no menu lateral
2. Use a busca para encontrar o usuário (nome, email ou CPF)
3. Você pode:
   - **WhatsApp**: Clique no botão verde para abrir conversa
   - **Editar**: Clique em "Editar" para ver detalhes e assinaturas
   - **Deletar**: Clique em "Deletar" (cuidado, ação irreversível!)

### Como Cancelar uma Assinatura

1. Vá em "👥 Usuários"
2. Clique em "Editar" no usuário desejado
3. Na modal que abrir, você verá as assinaturas ativas
4. Clique em "Cancelar Plano"
5. Confirme a ação

### Como Ver Pagamentos

1. Clique em "💳 Pagamentos" no menu lateral
2. Você verá todos os pagamentos com:
   - Nome do usuário
   - Método usado
   - Valor pago
   - Status (aprovado/pendente/rejeitado)
   - Data

### Como Gerenciar Postos

1. Clique em "⛽ Postos" no menu lateral
2. Veja a lista de todos os postos
3. Para deletar um posto:
   - Clique em "Deletar"
   - Confirme a ação

---

## 🔧 TROUBLESHOOTING

### Erro: "Erro na requisição"
**Causa:** Backend não está rodando ou URL incorreta
**Solução:**
1. Verifique se o backend está rodando em `http://localhost:3333`
2. Verifique o arquivo `.env` do painel:
   ```
   VITE_API_URL=http://localhost:3333
   ```

### Erro: "Token inválido"
**Causa:** Token JWT expirado ou inválido
**Solução:**
1. Faça logout
2. Faça login novamente
3. O novo token será armazenado

### Notificações não chegam
**Causa:** Usuários não têm token de push registrado
**Solução:**
1. Usuários precisam permitir notificações no app
2. Verifique se o serviço de push está configurado no backend

### Não consigo deletar usuário
**Causa:** Usuário tem assinaturas ou pagamentos vinculados
**Solução:**
1. Primeiro cancele as assinaturas ativas
2. Depois tente deletar novamente

---

## 🎨 DICAS DE USO

### Enviar Promoções
Use "Push Notifications" > "Usuários sem plano" para enviar ofertas especiais e converter usuários gratuitos em pagantes.

### Suporte Rápido
Use o botão "WhatsApp" na lista de usuários para dar suporte direto e rápido.

### Monitorar Receita
Acesse o Dashboard diariamente para acompanhar:
- Crescimento de usuários
- Novas assinaturas
- Receita gerada

### Busca Eficiente
Na tela de usuários, você pode buscar por:
- Nome completo ou parte dele
- Email completo ou parte dele
- CPF (com ou sem formatação)

---

## 📱 ATALHOS ÚTEIS

| Ação | Atalho |
|------|--------|
| Ir para Dashboard | Clique no logo "🚗 Secur APP" |
| Buscar usuário | Digite na caixa de busca |
| Enviar push rápido | Botão no topo do Dashboard |
| Abrir WhatsApp | Botão verde na lista de usuários |

---

## 🔐 SEGURANÇA

- Nunca compartilhe suas credenciais de admin
- O painel só deve ser acessado por administradores
- Todas as ações são registradas no sistema
- Use HTTPS em produção

---

## 📞 SUPORTE

Se tiver problemas:
1. Verifique se backend e frontend estão rodando
2. Verifique o console do navegador (F12)
3. Verifique os logs do backend
4. Entre em contato com o desenvolvedor

---

**Versão:** 1.0  
**Última atualização:** Novembro 2024
