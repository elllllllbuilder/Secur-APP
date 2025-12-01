# 🎨 Guia de Gerenciamento de Banners

## ✅ Implementado

### Backend
- ✅ Modelo Banner no Prisma
- ✅ API de gerenciamento de banners (`/admin/banners`)
- ✅ Upload de imagens
- ✅ Reordenação de banners
- ✅ Ativar/desativar banners
- ✅ Deletar banners

### Painel Admin
- ✅ Página de gerenciamento de banners
- ✅ Upload de imagens (drag & drop)
- ✅ Visualização de banners
- ✅ Reordenação (botões ↑ ↓)
- ✅ Ativar/desativar
- ✅ Deletar banners

### App Mobile
- ✅ Carrossel de banners dinâmico
- ✅ Busca banners da API
- ✅ Fallback para banners padrão (1.png, 2.png, 3.png)
- ✅ Auto-play do carrossel

## 📏 Especificações de Imagem

### Tamanho Recomendado
- **Largura:** 1200px (ou maior)
- **Altura:** 600px
- **Proporção:** 2:1 (landscape)
- **Tamanho máximo:** 5MB
- **Formatos:** JPG, PNG, GIF

### Dicas de Design
- Use imagens de alta qualidade
- Evite texto muito pequeno (será visualizado em mobile)
- Mantenha elementos importantes no centro
- Use cores vibrantes que chamem atenção

## 🚀 Como Usar

### 1. Acessar o Painel Admin
1. Faça login no painel admin
2. Clique em "🎨 Banners" no menu lateral

### 2. Adicionar Novo Banner
1. Clique no botão "+ Adicionar Banner"
2. Selecione uma imagem do seu computador
3. Aguarde o upload
4. O banner será adicionado automaticamente ao final da lista

### 3. Reordenar Banners
- Use os botões **↑** e **↓** para mover banners para cima ou para baixo
- A ordem define a sequência de exibição no app

### 4. Ativar/Desativar Banner
- Clique em "Desativar" para ocultar um banner sem deletá-lo
- Clique em "Ativar" para torná-lo visível novamente
- Apenas banners ativos aparecem no app

### 5. Deletar Banner
- Clique em "Deletar" para remover permanentemente
- Confirmação será solicitada

## 🔧 Configuração Técnica

### Variáveis de Ambiente
Certifique-se de que o backend está configurado corretamente:

```env
# backend/.env
DATABASE_URL="sua_url_do_postgres"
```

### Pasta de Uploads
Os banners são salvos em:
```
backend/uploads/banners/
```

### API Endpoints

#### Público (sem autenticação)
```
GET /banners
```
Retorna lista de banners ativos ordenados

#### Admin (requer autenticação)
```
GET    /admin/banners          # Lista todos os banners
POST   /admin/banners          # Upload novo banner (multipart/form-data)
PUT    /admin/banners/:id      # Atualizar banner (active, order)
PUT    /admin/banners/:id/reorder  # Reordenar banner
DELETE /admin/banners/:id      # Deletar banner
```

## 📱 Visualização no App

### Tela de Login
- Logo UFAe substituiu "Secur APP"
- Subtítulo: "Benefícios que aliviam"
- Logo deve estar em: `frontend/assets/logo.png`

### Tela Member/Index
- Carrossel de banners no topo
- Auto-play a cada 4 segundos
- Indicadores de posição
- Banners buscados da API
- Fallback para banners locais (1.png, 2.png, 3.png)

## 🎯 Próximos Passos

1. **Criar as imagens dos banners:**
   - Crie 3 imagens (1200x600px)
   - Salve como: `frontend/assets/1.png`, `2.png`, `3.png`
   - Crie o logo: `frontend/assets/logo.png`

2. **Fazer upload via painel admin:**
   - Acesse o painel
   - Faça upload das imagens
   - Configure a ordem desejada

3. **Testar no app:**
   - Abra o app mobile
   - Verifique se os banners aparecem
   - Teste o carrossel

## ⚠️ Troubleshooting

### Banners não aparecem no app
- Verifique se há banners ativos no painel admin
- Confirme que o backend está rodando
- Verifique a variável `EXPO_PUBLIC_API_URL` no frontend

### Erro ao fazer upload
- Verifique o tamanho da imagem (máx 5MB)
- Confirme que é JPG, PNG ou GIF
- Verifique permissões da pasta `backend/uploads/banners/`

### Imagens não carregam
- Verifique se a pasta `uploads` está sendo servida pelo backend
- Confirme que o `main.ts` tem: `app.useStaticAssets(join(__dirname, '..', 'uploads'))`
