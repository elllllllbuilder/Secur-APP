# Configuração do Mercado Pago

## 1. Criar Conta no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers
2. Crie uma conta de desenvolvedor
3. Acesse "Suas integrações" → "Criar aplicação"

## 2. Obter Credenciais

### Modo Teste (Sandbox)
1. No painel, vá em "Credenciais de teste"
2. Copie o **Access Token de teste**
3. Cole no `.env`: `MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx`

### Modo Produção
1. No painel, vá em "Credenciais de produção"
2. Copie o **Access Token de produção**
3. Cole no `.env`: `MERCADOPAGO_ACCESS_TOKEN=APP-xxxxx`

## 3. Configurar Webhook

Para receber notificações de pagamento:

1. No painel do Mercado Pago, vá em "Webhooks"
2. Adicione a URL: `https://seu-dominio.com/webhooks/mercadopago`
3. Selecione os eventos: `payment`

## 4. Testar Pagamentos

### PIX (Pagamento Único)
```bash
# 1. Criar assinatura
POST /me/associate
{
  "activitySlug": "motorista",
  "planId": "plan_123"
}

# 2. Criar pagamento PIX
POST /me/checkout/pix
{
  "subscriptionId": "sub_123"
}

# Resposta:
{
  "invoiceId": "pay_123",
  "amountCents": 9900,
  "pixQr": "data:image/png;base64,...",
  "pixCopyPaste": "00020126...",
  "expiresAt": "2024-01-01T12:30:00Z"
}
```

### Assinatura Recorrente (Mensal)
```bash
# Criar assinatura recorrente
POST /me/subscription/recurring
{
  "planId": "plan_123"
}

# Resposta:
{
  "subscriptionId": "sub_456",
  "checkoutUrl": "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_id=xxx",
  "status": "pending"
}

# Cancelar assinatura
POST /me/subscription/cancel
{
  "subscriptionId": "sub_456"
}
```

### Cartões de Teste

No ambiente de teste, use estes cartões:

**Aprovado:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: `11/25`

**Recusado:**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Validade: `11/25`

## 5. Fluxo de Pagamento

### Pagamento Único (PIX)
```
1. Usuário escolhe plano → POST /me/associate
2. Sistema cria subscription
3. Usuário escolhe PIX → POST /me/checkout/pix
4. Sistema cria pagamento no MP e retorna QR Code
5. Usuário paga via PIX
6. MP envia webhook → POST /webhooks/mercadopago
7. Sistema atualiza status do pagamento
8. Subscription fica ACTIVE
```

### Assinatura Recorrente (Mensal)
```
1. Usuário escolhe plano → POST /me/subscription/recurring
2. Sistema cria plano no MP (se não existir)
3. Sistema cria assinatura no MP
4. Retorna URL de checkout
5. Usuário preenche dados do cartão no MP
6. MP cobra automaticamente todo mês
7. MP envia webhook a cada cobrança
8. Sistema mantém subscription ACTIVE

Cancelar: POST /me/subscription/cancel
```

## 6. Status de Pagamento

- `pending` - Aguardando pagamento
- `approved` - Pagamento aprovado
- `rejected` - Pagamento recusado
- `cancelled` - Pagamento cancelado
- `refunded` - Pagamento estornado

## 7. Documentação Oficial

- SDK Node.js: https://github.com/mercadopago/sdk-nodejs
- API Reference: https://www.mercadopago.com.br/developers/pt/reference
- Webhooks: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

## 8. Segurança

⚠️ **IMPORTANTE:**
- Nunca exponha o Access Token no frontend
- Use HTTPS em produção
- Valide webhooks verificando a assinatura
- Implemente rate limiting nos endpoints de pagamento


## 9. Assinaturas Recorrentes - Detalhes

### Vantagens
- ✅ Cobrança automática mensal
- ✅ Cliente não precisa pagar todo mês manualmente
- ✅ Aceita cartão de crédito
- ✅ Retry automático em caso de falha
- ✅ Notificações de cobrança

### Status de Assinatura
- `pending` - Aguardando autorização do cliente
- `authorized` - Assinatura ativa, cobrando mensalmente
- `paused` - Assinatura pausada
- `cancelled` - Assinatura cancelada

### Webhooks de Assinatura
O Mercado Pago envia notificações para:
- Nova assinatura criada
- Pagamento mensal aprovado
- Pagamento mensal recusado
- Assinatura cancelada

### Exemplo de Webhook
```json
{
  "type": "subscription_preapproval",
  "data": {
    "id": "2c938084726fca480172750000000000"
  }
}
```

### Gerenciamento pelo Cliente
O cliente pode:
- Atualizar dados do cartão no painel do MP
- Cancelar assinatura a qualquer momento
- Ver histórico de cobranças

### Taxas do Mercado Pago
- **PIX:** 0,99% por transação
- **Cartão de Crédito:** ~3,99% + R$ 0,40 por transação
- **Assinaturas:** Mesma taxa do cartão de crédito

### Importante
⚠️ Para assinaturas recorrentes, o cliente **precisa cadastrar um cartão de crédito** no checkout do Mercado Pago. PIX não funciona para recorrência.
