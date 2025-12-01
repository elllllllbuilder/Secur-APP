# 📧 Configuração de Email (SMTP)

## Para usar Gmail

1. **Ative a verificação em 2 etapas** na sua conta Google
   - Acesse: https://myaccount.google.com/security
   - Ative "Verificação em duas etapas"

2. **Crie uma senha de app**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Email" e "Outro (nome personalizado)"
   - Digite "Secur APP" e clique em "Gerar"
   - Copie a senha gerada (16 caracteres)

3. **Configure no .env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # Senha de app gerada
   ```

## Para usar outros provedores

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

### SendGrid (recomendado para produção)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxx  # API Key do SendGrid
```

### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=seu-smtp-username
SMTP_PASS=seu-smtp-password
```

## Testando

Após configurar, reinicie o backend e teste:

```bash
# Endpoint de teste (requer autenticação)
POST http://localhost:3333/me/subscription/check-expirations
```

Isso executará o job manualmente e enviará emails se houver assinaturas próximas do vencimento.

## Emails Enviados

O sistema envia 5 tipos de emails:

1. **Confirmação de pagamento** - Quando pagamento é aprovado
2. **Aviso 10 dias** - 10 dias antes do vencimento
3. **Aviso 5 dias** - 5 dias antes do vencimento
4. **Aviso 2 dias** - 2 dias antes do vencimento
5. **Aviso 1 dia** - 1 dia antes do vencimento
6. **Expiração** - Quando a assinatura expira

## Produção

Para produção, recomendamos usar um serviço dedicado:

- **SendGrid** - 100 emails/dia grátis
- **Amazon SES** - $0.10 por 1000 emails
- **Mailgun** - 5000 emails/mês grátis
- **Postmark** - Especializado em transacionais

Esses serviços têm melhor deliverability e não são bloqueados como spam.
