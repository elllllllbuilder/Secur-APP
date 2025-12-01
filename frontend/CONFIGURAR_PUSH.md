# 🔔 COMO CONFIGURAR PUSH NOTIFICATIONS

## ⚠️ STATUS ATUAL

Push notifications estão **DESABILITADAS** por padrão.

O app funciona normalmente sem elas. Para habilitar, siga os passos abaixo.

---

## 🚀 OPÇÃO 1: Usar Expo (Recomendado)

### Passo 1: Criar conta no Expo
```bash
# Instalar Expo CLI
npm install -g eas-cli

# Fazer login
eas login
```

### Passo 2: Criar projeto no Expo
```bash
cd frontend
eas init
```

Isso vai gerar um `projectId` UUID válido.

### Passo 3: Verificar app.json
O arquivo `app.json` deve ter algo assim:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "12345678-1234-1234-1234-123456789abc"
      }
    }
  }
}
```

### Passo 4: Reiniciar o app
```bash
# Ctrl+C para parar
npx expo start
```

✅ Push notifications agora funcionam!

---

## 🚀 OPÇÃO 2: Usar Firebase (Alternativa)

### Passo 1: Criar projeto no Firebase
1. Acesse: https://console.firebase.google.com
2. Crie um novo projeto
3. Adicione um app Android/iOS

### Passo 2: Baixar configurações
- Android: `google-services.json`
- iOS: `GoogleService-Info.plist`

### Passo 3: Configurar no app
```bash
# Instalar plugin
npx expo install @react-native-firebase/app @react-native-firebase/messaging
```

### Passo 4: Atualizar código
Substituir `expo-notifications` por `@react-native-firebase/messaging`

---

## 🚀 OPÇÃO 3: Desabilitar (Atual)

Se não precisa de push notifications agora:

✅ **Nada a fazer!** O app já está configurado para funcionar sem elas.

O código detecta automaticamente e desabilita push se não houver `projectId` válido.

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### Console do app deve mostrar:

**Com push habilitado:**
```
✅ Push Token registrado: ExponentPushToken[xxxxxx]
```

**Com push desabilitado (atual):**
```
⚠️ Push notifications desabilitadas (projectId não configurado)
💡 Para habilitar, configure um projectId UUID válido no app.json
```

---

## 📊 COMPARAÇÃO

| Recurso | Expo | Firebase | Desabilitado |
|---------|------|----------|--------------|
| Facilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Custo | Grátis | Grátis | Grátis |
| Setup | 5 min | 30 min | 0 min |
| Funciona em dev | ✅ | ✅ | ❌ |
| Funciona em prod | ✅ | ✅ | ❌ |

---

## 🎯 RECOMENDAÇÃO

### Para desenvolvimento:
✅ **Deixe desabilitado** - O app funciona perfeitamente sem push

### Para produção:
✅ **Use Expo** - Mais fácil e rápido de configurar

### Para apps grandes:
✅ **Use Firebase** - Mais controle e recursos avançados

---

## 🐛 PROBLEMAS COMUNS

### "Invalid uuid"
**Causa:** projectId não é um UUID válido  
**Solução:** Use `eas init` para gerar um UUID correto

### "projectId not found"
**Causa:** Não tem projectId no app.json  
**Solução:** Adicione manualmente ou use `eas init`

### "Push token not registered"
**Causa:** Push está desabilitado  
**Solução:** Configure um projectId válido

---

## 💡 DICA

Você pode desenvolver e testar o app **SEM** push notifications.

Quando for publicar na loja, aí sim configure o push seguindo a **Opção 1**.

---

## ✅ CHECKLIST

Para habilitar push notifications:

- [ ] Criar conta no Expo
- [ ] Instalar `eas-cli`
- [ ] Rodar `eas init` no projeto
- [ ] Verificar `projectId` no app.json
- [ ] Reiniciar o app
- [ ] Testar em dispositivo físico

---

## 📞 SUPORTE

### Documentação oficial:
- Expo: https://docs.expo.dev/push-notifications/overview/
- Firebase: https://firebase.google.com/docs/cloud-messaging

### Guias do projeto:
- `PUSH_NOTIFICATIONS.md` - Como usar push no app
- `COMO_USAR_PAINEL_ADMIN.md` - Como enviar notificações

---

**Status atual:** ⚠️ Push desabilitado (app funciona normalmente)  
**Para habilitar:** Siga a Opção 1 acima  
**Última atualização:** Novembro 2024
