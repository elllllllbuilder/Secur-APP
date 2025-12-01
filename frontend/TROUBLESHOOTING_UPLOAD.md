# 🔧 TROUBLESHOOTING - Upload de Documentos

## ❌ Erro: "Network request failed"

### Possíveis Causas:

#### 1. **Backend não está rodando**
```bash
# Verifique se o backend está rodando
cd backend
npm run start:dev
```

#### 2. **IP incorreto no .env**
Verifique o arquivo `frontend/.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.6:3333
```

**Como descobrir o IP correto:**
```bash
# Windows
ipconfig
# Procure "IPv4 Address"

# Linux/Mac
ifconfig
# Procure "inet"
```

#### 3. **CORS não configurado**
Verifique `backend/.env`:
```env
FRONTEND_ORIGIN=http://192.168.1.6:8081,http://localhost:8081
```

Adicione o IP do Expo (geralmente porta 8081).

#### 4. **Arquivo muito grande**
O limite atual é 20MB. Se o arquivo for maior, reduza o tamanho ou aumente o limite no backend.

#### 5. **Timeout**
Upload de arquivos grandes pode demorar. Aguarde alguns segundos.

---

## ✅ SOLUÇÃO RÁPIDA

### Passo 1: Verifique o Backend
```bash
cd backend
npm run start:dev
```

Deve aparecer:
```
🚀 Backend rodando em http://192.168.1.6:3333
🔗 CORS: http://192.168.1.6:8081, http://localhost:8081
```

### Passo 2: Verifique o IP
No terminal do Expo, veja qual IP está sendo usado:
```
› Metro waiting on exp://192.168.1.6:8081
```

### Passo 3: Configure o CORS
Adicione esse IP no `backend/.env`:
```env
FRONTEND_ORIGIN=http://192.168.1.6:8081,http://localhost:8081
```

### Passo 4: Reinicie o Backend
```bash
cd backend
# Ctrl+C
npm run start:dev
```

### Passo 5: Teste Novamente
1. Reinicie o app (Ctrl+C e `npx expo start`)
2. Tente enviar um documento pequeno (foto)
3. Aguarde alguns segundos

---

## 🔍 DEBUG AVANÇADO

### Ver logs detalhados
Os logs mostram:
```
[UPLOAD] URL: http://192.168.1.6:3333/me/documents
[UPLOAD] Enviando documento para userId: xxx
[UPLOAD] Iniciando upload...
[UPLOAD] Resposta recebida, status: 200
[UPLOAD] Sucesso!
```

Se parar em "Iniciando upload..." = problema de rede/timeout

### Testar conexão manualmente
No navegador do celular, acesse:
```
http://192.168.1.6:3333
```

Se não abrir = backend não está acessível na rede.

### Verificar firewall (Windows)
```powershell
# Execute como Administrador
netsh advfirewall firewall add rule name="Node Backend" dir=in action=allow protocol=TCP localport=3333
```

---

## 🎯 CHECKLIST

- [ ] Backend rodando
- [ ] IP correto no frontend/.env
- [ ] IP correto no backend/.env (CORS)
- [ ] Backend reiniciado após alterar .env
- [ ] App reiniciado
- [ ] Celular e PC na mesma rede WiFi
- [ ] Firewall não está bloqueando porta 3333

---

## 💡 DICA

**Use arquivo pequeno para testar:**
- Tire uma foto nova (menor)
- Não use arquivos PDF grandes
- Teste com imagem de 1-2 MB primeiro

---

## 🆘 AINDA NÃO FUNCIONA?

### Opção 1: Use localhost (apenas emulador)
Se estiver usando emulador Android:
```env
# frontend/.env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
```

### Opção 2: Use ngrok (temporário)
```bash
# Instale ngrok
npm install -g ngrok

# Exponha o backend
ngrok http 3333

# Use a URL do ngrok no frontend/.env
EXPO_PUBLIC_API_URL=https://xxxx.ngrok.io
```

---

**Última atualização:** Novembro 2024
