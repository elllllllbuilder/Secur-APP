# 🔔 PUSH NOTIFICATIONS - Secur APP

## ✅ CORREÇÃO APLICADA

O erro do `projectId` foi corrigido! O app agora funciona normalmente.

---

## 📱 COMO FUNCIONAM AS NOTIFICAÇÕES

### Em Desenvolvimento (Expo Go)
- ✅ Funciona em dispositivos físicos
- ❌ Não funciona em emuladores
- ⚠️ Requer permissão do usuário

### Em Produção (Build)
- ✅ Funciona em todos os dispositivos
- ✅ Notificações nativas
- ✅ Funciona em background

---

## 🔧 CONFIGURAÇÃO

### 1. Project ID
Já configurado no `app.json`:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "secur-app-project"
      }
    }
  }
}
```

### 2. Permissões
O app pede permissão automaticamente no primeiro uso.

### 3. Backend
O token é enviado automaticamente para o backend em:
- Login
- Registro
- Atualização do app

---

## 🚀 TESTANDO NOTIFICAÇÕES

### Opção 1: Pelo Painel Admin
1. Acesse o painel: `http://localhost:5173`
2. Faça login como admin
3. Vá em "🔔 Push Notifications"
4. Escolha o público
5. Digite título e mensagem
6. Envie!

### Opção 2: Pelo Backend (API)
```bash
# Enviar para todos
curl -X POST http://localhost:3333/notifications/send-to-all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "title": "Teste",
    "body": "Mensagem de teste"
  }'

# Enviar para usuários com plano
curl -X POST http://localhost:3333/notifications/send-to-users-with-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "title": "Promoção",
    "body": "Oferta especial para assinantes"
  }'

# Enviar para usuários sem plano
curl -X POST http://localhost:3333/notifications/send-to-users-without-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "title": "Assine agora",
    "body": "50% de desconto no primeiro mês"
  }'
```

### Opção 3: Expo Push Tool
1. Acesse: https://expo.dev/notifications
2. Cole o token do usuário
3. Digite título e mensagem
4. Envie!

---

## 📊 FLUXO DAS NOTIFICAÇÕES

```
1. Usuário abre o app
   ↓
2. App pede permissão
   ↓
3. Usuário aceita
   ↓
4. App gera Expo Push Token
   ↓
5. Token é enviado para o backend
   ↓
6. Backend salva no banco (campo pushToken)
   ↓
7. Admin envia notificação pelo painel
   ↓
8. Backend busca tokens dos usuários
   ↓
9. Backend envia para Expo Push Service
   ↓
10. Expo entrega para o dispositivo
    ↓
11. Usuário recebe a notificação
```

---

## 🐛 PROBLEMAS COMUNS

### "Permissão negada"
**Causa:** Usuário negou permissão  
**Solução:** 
- Android: Configurações > Apps > Secur APP > Notificações > Ativar
- iOS: Ajustes > Secur APP > Notificações > Permitir

### "Token não registrado"
**Causa:** Token não foi enviado para o backend  
**Solução:** Faça logout e login novamente

### "Notificação não chega"
**Causas possíveis:**
1. App não está em background
2. Token expirou
3. Permissão foi revogada
4. Dispositivo sem internet

**Soluções:**
1. Coloque o app em background
2. Faça logout e login
3. Verifique permissões
4. Conecte à internet

### "Só funciona em dispositivo físico"
**Causa:** Emuladores não suportam push  
**Solução:** Use um dispositivo físico ou build de produção

---

## 🔍 DEBUG

### Ver token do usuário
```javascript
// No app, abra o console e execute:
import * as Notifications from 'expo-notifications';
const token = await Notifications.getExpoPushTokenAsync();
console.log('Token:', token.data);
```

### Verificar se token está no backend
```bash
# Prisma Studio
cd backend
npm run prisma:studio

# Abra a tabela User
# Procure o campo pushToken
```

### Testar envio manual
```bash
# Enviar notificação de teste
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[SEU_TOKEN_AQUI]",
    "title": "Teste",
    "body": "Mensagem de teste",
    "sound": "default"
  }'
```

---

## 📝 CÓDIGO IMPORTANTE

### Registrar token (já implementado)
```typescript
// services/notifications.ts
export async function registerForPushNotificationsAsync() {
  // Pede permissão
  // Gera token
  // Retorna token
}
```

### Enviar token para backend (já implementado)
```typescript
// services/notifications.ts
export async function sendPushTokenToBackend(token: string) {
  await api.post('/notifications/register-token', { pushToken: token });
}
```

### Configurar listeners (já implementado)
```typescript
// services/notifications.ts
export function setupNotificationListeners(
  onNotificationReceived,
  onNotificationTapped
) {
  // Escuta notificações
  // Chama callbacks
}
```

---

## 🎯 BOAS PRÁTICAS

### 1. Pedir permissão no momento certo
- ✅ Após login
- ✅ Quando usuário ativa notificações
- ❌ Logo ao abrir o app

### 2. Explicar o benefício
- ✅ "Receba alertas de promoções"
- ✅ "Seja notificado de novidades"
- ❌ "Permitir notificações?"

### 3. Respeitar preferências
- ✅ Permitir desativar
- ✅ Permitir escolher tipos
- ❌ Enviar spam

### 4. Testar antes de enviar
- ✅ Teste com seu próprio dispositivo
- ✅ Verifique ortografia
- ✅ Teste em diferentes horários

---

## 📊 TIPOS DE NOTIFICAÇÃO

### 1. Marketing
- Promoções
- Novidades
- Ofertas especiais
- **Público:** Usuários sem plano

### 2. Transacionais
- Pagamento aprovado
- Assinatura renovada
- Documento aprovado
- **Público:** Todos

### 3. Engajamento
- "Há quanto tempo!"
- "Novos postos próximos"
- "Atualize seu perfil"
- **Público:** Usuários inativos

---

## ⚠️ IMPORTANTE

### Limitações do Expo
- Máximo 100 notificações por segundo
- Máximo 1000 notificações por hora
- Token expira após 30 dias de inatividade

### Recomendações
- Não envie spam
- Respeite horários (evite madrugada)
- Segmente o público
- Teste antes de enviar em massa

---

## 🎉 PRONTO!

As notificações push estão configuradas e funcionando!

**Para testar:**
1. Abra o app em um dispositivo físico
2. Aceite as permissões
3. Envie uma notificação pelo painel admin
4. Coloque o app em background
5. Receba a notificação!

---

**Última atualização:** Novembro 2024
