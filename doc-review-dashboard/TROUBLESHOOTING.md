# 🔧 TROUBLESHOOTING - Painel Admin

## ❌ Erro: "Erro ao carregar dados"

### Causa 1: Backend não está rodando
**Solução:**
```bash
cd backend
npm run start:dev
```
✅ Verifique se aparece: `Application is running on: http://localhost:3333`

### Causa 2: URL incorreta no .env
**Verifique o arquivo:** `doc-review-dashboard/.env`
```env
VITE_API_URL=http://localhost:3333
```

**Se o backend está em outro IP:**
```env
VITE_API_URL=http://192.168.1.24:3333
```

**Depois de alterar o .env:**
```bash
# Pare o painel (Ctrl+C)
npm run dev  # Inicie novamente
```

### Causa 3: CORS não configurado
**Verifique:** `backend/src/main.ts`

Deve ter:
```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'http://192.168.1.24:5173'],
  credentials: true,
});
```

---

## ❌ Erro: "Não autorizado" ou "401"

### Causa: Token inválido ou expirado
**Solução:**
1. Clique em "🚪 Sair" no painel
2. Faça login novamente
3. Use credenciais de um usuário admin

### Como criar um usuário admin:
```bash
cd backend
npm run prisma:studio
```

1. Abra a tabela `User`
2. Encontre seu usuário
3. Altere o campo `role` para `ADMIN`
4. Salve

---

## ❌ Erro: "Failed to fetch"

### Causa 1: Backend não está acessível
**Teste no navegador:**
```
http://localhost:3333/health
```

Se não abrir, o backend não está rodando.

### Causa 2: Firewall bloqueando
**Windows:**
```powershell
# Permitir porta 3333
netsh advfirewall firewall add rule name="Backend" dir=in action=allow protocol=TCP localport=3333
```

### Causa 3: IP errado
**Descubra seu IP:**
```bash
# Windows
ipconfig

# Procure por "IPv4 Address"
# Exemplo: 192.168.1.24
```

**Atualize o .env:**
```env
VITE_API_URL=http://SEU_IP:3333
```

---

## ❌ Painel não carrega (tela branca)

### Solução 1: Limpar cache
```bash
# Pare o painel (Ctrl+C)
rm -rf node_modules/.vite
npm run dev
```

### Solução 2: Reinstalar dependências
```bash
rm -rf node_modules
npm install
npm run dev
```

### Solução 3: Verificar console
1. Abra o navegador (F12)
2. Vá em "Console"
3. Veja os erros
4. Copie e pesquise a solução

---

## ❌ Login não funciona

### Causa 1: Credenciais incorretas
**Verifique:**
- Email está correto?
- Senha está correta?
- Usuário existe no banco?

### Causa 2: Endpoint de login não existe
**Teste:**
```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"senha123"}'
```

Se retornar erro 404, o endpoint não existe.

### Causa 3: Usuário não é admin
**Verifique no Prisma Studio:**
```bash
cd backend
npm run prisma:studio
```

Campo `role` deve ser `ADMIN`

---

## ❌ Notificações não enviam

### Causa 1: Endpoint não existe
**Verifique:** `backend/src/notifications/notifications.controller.ts`

Deve ter:
```typescript
@Post('send-to-all')
@Post('send-to-users-with-plan')
@Post('send-to-users-without-plan')
```

### Causa 2: Serviço de push não configurado
**Verifique:** `backend/src/notifications/push.service.ts`

Deve ter configuração do Firebase ou OneSignal.

---

## ❌ Postos não aparecem

### Causa: Nenhum posto cadastrado
**Solução: Cadastrar postos manualmente**

```bash
cd backend
npm run prisma:studio
```

1. Abra a tabela `GasStation`
2. Clique em "Add record"
3. Preencha:
   - name: "Posto Exemplo"
   - latitude: -23.5505
   - longitude: -46.6333
   - address: "Rua Exemplo, 123"
   - hasElectricCharger: false
4. Salve

---

## ❌ Erro: "Cannot read property 'map' of undefined"

### Causa: Dados não são array
**Já corrigido no código!**

Se ainda acontecer, verifique se o backend está retornando array:
```typescript
// Deve retornar:
[{...}, {...}]

// Não deve retornar:
{data: [{...}]}
```

---

## 🔍 DEBUG AVANÇADO

### Ver requisições no console
1. Abra o navegador (F12)
2. Vá em "Network"
3. Clique em uma requisição
4. Veja:
   - Request URL
   - Request Headers
   - Response

### Ver logs do backend
```bash
cd backend
npm run start:dev

# Veja os logs no terminal
```

### Testar endpoints manualmente
```bash
# Login
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'

# Copie o token retornado

# Listar usuários
curl http://localhost:3333/admin/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📞 CHECKLIST DE VERIFICAÇÃO

Antes de pedir ajuda, verifique:

- [ ] Backend está rodando em `http://localhost:3333`
- [ ] Painel está rodando em `http://localhost:5173`
- [ ] Arquivo `.env` está configurado corretamente
- [ ] Consegue acessar `http://localhost:3333/health`
- [ ] Usuário tem role `ADMIN` no banco
- [ ] Console do navegador (F12) não mostra erros
- [ ] CORS está configurado no backend
- [ ] Token está sendo enviado nas requisições

---

## 🆘 SOLUÇÃO RÁPIDA

Se nada funcionar, tente:

```bash
# 1. Pare tudo (Ctrl+C em ambos terminais)

# 2. Backend
cd backend
rm -rf node_modules
npm install
npm run start:dev

# 3. Painel (em outro terminal)
cd doc-review-dashboard
rm -rf node_modules
npm install
npm run dev

# 4. Limpe o cache do navegador
# Ctrl+Shift+Delete → Limpar cache

# 5. Acesse novamente
http://localhost:5173
```

---

## 📖 LOGS ÚTEIS

### Backend rodando corretamente:
```
[Nest] 12345  - 30/11/2024, 10:00:00     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 30/11/2024, 10:00:00     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 30/11/2024, 10:00:00     LOG [RoutesResolver] AdminController {/admin}:
[Nest] 12345  - 30/11/2024, 10:00:00     LOG [RouterExplorer] Mapped {/admin/users, GET} route
[Nest] 12345  - 30/11/2024, 10:00:00     LOG [NestApplication] Nest application successfully started
```

### Painel rodando corretamente:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.24:5173/
  ➜  press h + enter to show help
```

---

## ✅ TUDO FUNCIONANDO?

Se seguiu todos os passos e ainda não funciona:

1. Tire um print do erro no console (F12)
2. Copie os logs do backend
3. Verifique o arquivo `.env`
4. Entre em contato com o desenvolvedor

---

**Última atualização:** Novembro 2024
