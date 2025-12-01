# 🎛️ Painel Admin - Secur APP

Painel administrativo completo para gerenciar o app Secur.

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie o arquivo `.env`:
```env
VITE_API_URL=http://localhost:3333
```

### 3. Iniciar o Painel
```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## ✨ Funcionalidades

- ✅ **Dashboard** - Estatísticas em tempo real
- ✅ **Usuários** - Gestão completa com busca, edição e exclusão
- ✅ **Pagamentos** - Histórico completo de transações
- ✅ **Push Notifications** - Envio segmentado de notificações
- ✅ **Postos** - Gestão de postos de gasolina
- ✅ **Conteúdo** - Gerenciamento de banners e termos
- ✅ **Configurações** - Configurações do sistema

---

## 📖 Documentação

- **📘 Guia Completo de Uso:** `GUIA_USO_PAINEL.md`
- **📗 Documentação Técnica:** `../PAINEL_ADMIN_COMPLETO.md`

---

## 🎯 Como Usar

### Enviar Push Notification
1. Clique em "🔔 Push Notifications"
2. Escolha o público (todos, com plano, sem plano)
3. Digite título e mensagem
4. Enviar

### Gerenciar Usuário
1. Clique em "👥 Usuários"
2. Busque por nome, email ou CPF
3. Use os botões: WhatsApp, Editar ou Deletar

### Ver Pagamentos
1. Clique em "💳 Pagamentos"
2. Veja histórico completo com status

---

## 🔧 Tecnologias

- React 18
- TypeScript
- Vite
- CSS Modules

---

## 🐛 Troubleshooting

### Erro: "Erro na requisição"
✅ Verifique se o backend está rodando em `http://localhost:3333`

### Erro: "Token inválido"
✅ Faça logout e login novamente

### Painel não carrega
✅ Verifique o arquivo `.env`
✅ Verifique o console do navegador (F12)

---

## 📞 Suporte

Problemas? Consulte:
1. `GUIA_USO_PAINEL.md` - Guia completo
2. Console do navegador (F12)
3. Logs do backend

---

## 🎉 Pronto para Usar!

O painel está 100% funcional. Explore todas as funcionalidades e gerencie seu app com facilidade!
