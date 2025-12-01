# 🐛 Correção: Checkout de Cartão Recorrente

## Problema Identificado

Quando o usuário clicava em "Cartão de Crédito" para assinatura recorrente, o sistema ativava o plano **IMEDIATAMENTE**, sem esperar o pagamento ser confirmado.

### O que estava acontecendo:
```typescript
// ❌ ERRADO - Ativava antes do pagamento
const subscription = await this.prisma.subscription.create({
  data: {
    status: SubStatus.ACTIVE, // ❌ JÁ ATIVO!
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
});
```

## ✅ Correção Aplicada

### 1. Subscription criada como INCOMPLETE
```typescript
// ✅ CORRETO - Aguarda confirmação
const subscription = await this.prisma.subscription.create({
  data: {
    status: SubStatus.INCOMPLETE, // ⏳ Aguardando pagamento
    provider: 'mercadopago',
    providerSubId: mpSubscription.id,
  },
});
```

### 2. Webhook melhorado
Agora o webhook:
- ✅ Busca o status **REAL** do pagamento no Mercado Pago
- ✅ Processa webhooks de **pagamento** (PIX, Boleto)
- ✅ Processa webhooks de **assinatura** (renovação, cancelamento)
- ✅ Só ativa quando o MP confirmar o pagamento

### 3. Fluxo Correto

```
1. Usuário clica em "Cartão de Crédito"
   └─> Subscription criada com status: INCOMPLETE

2. Usuário é redirecionado para Mercado Pago
   └─> Cadastra cartão e confirma pagamento

3. Mercado Pago envia webhook
   └─> Backend busca status real no MP
   └─> Se aprovado: status muda para ACTIVE
   └─> Envia email de confirmação
   └─> Envia push notification

4. Usuário volta ao app
   └─> Plano está ativo ✅
```

## 📝 Arquivos Modificados

### backend/src/checkout/checkout.service.ts
- Linha 145: `status: SubStatus.INCOMPLETE` (era ACTIVE)
- Removido: `currentPeriodEnd` na criação (só define após pagamento)
- Adicionado: `processPaymentWebhook()` - busca status real no MP
- Adicionado: `processSubscriptionWebhook()` - processa renovações

### backend/src/checkout/checkout.controller.ts
- Webhook agora processa `payment` e `subscription`
- Chama métodos específicos para cada tipo

## 🧪 Como Testar

### Teste 1: Assinatura Recorrente
1. Faça login no app
2. Vá em "Associar-se"
3. Escolha um plano
4. Clique em "Cartão de Crédito"
5. **Verifique:** Status deve ser INCOMPLETE
6. Complete o pagamento no MP
7. **Verifique:** Status muda para ACTIVE após webhook

### Teste 2: Webhook Manual
```bash
# Simular webhook de pagamento aprovado
curl -X POST http://localhost:3333/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": { "id": "123456789" }
  }'
```

## ⚠️ Importante

### Configuração do Webhook no Mercado Pago
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Vá em "Webhooks"
3. Configure a URL: `https://seu-dominio.com/webhooks/mercadopago`
4. Eventos: `payment` e `subscription`

### Variáveis de Ambiente
```env
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
FRONTEND_URL=https://seu-app.com
```

## 🎯 Resultado

Agora o sistema funciona corretamente:
- ✅ Não ativa plano antes do pagamento
- ✅ Webhook processa corretamente
- ✅ Usuário só tem acesso após pagar
- ✅ Renovações automáticas funcionam
- ✅ Cancelamentos são processados
