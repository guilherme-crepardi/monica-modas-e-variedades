# Monica Modas e Variedades — Documentação do Projeto

## Visão geral

Site catálogo (vitrine) para a loja **Monica Modas e Variedades**, inspirado visualmente na Zattini. Exibe os produtos com fotos e preços; a compra é feita pelo WhatsApp. Não há carrinho nem checkout.

Os dados (produtos e categorias) ficam no **Supabase** e são gerenciados pelo **painel administrativo** (`admin.html`) — não é mais necessário editar código para adicionar produtos ou fotos.

## Arquitetura

Site estático (HTML/CSS/JS puro) hospedado na **Vercel**, com **Supabase** como banco de dados e armazenamento de fotos.

```
raiz/
├── index.html          → loja pública (sem login)
├── admin.html          → painel administrativo (com login)
├── css/
│   ├── style.css       → visual da loja
│   └── admin.css       → visual do painel
├── js/
│   ├── config.js       → URL do Supabase, anon key e número do WhatsApp
│   ├── app.js          → loja: carrega dados do Supabase e renderiza
│   └── admin.js        → painel: login, CRUD de categorias/produtos, upload
├── supabase/
│   └── setup.sql       → cria tabelas, RLS, storage e produtos iniciais
├── fotos/              → fotos usadas como caminho relativo (imagem_url)
└── docs/
    └── agentes.md      → este documento
```

### Fluxo de dados

1. A loja (`app.js`) consulta o Supabase (chave anon, **somente leitura pública**):
   - `categorias` → nome, slug, ordem
   - `produtos` → com a categoria correspondente (join)
2. O painel (`admin.js`) autentica com e-mail/senha e faz **criar/editar/excluir** categorias e produtos, além de **upload de fotos** para o storage `fotos`.
3. Se o produto não tiver foto (`imagem_url` vazio), a loja gera um placeholder SVG automático com o ícone da categoria.

## Supabase

- **Tabela `categorias`:** `id`, `nome`, `slug`, `ordem`
- **Tabela `produtos`:** `id`, `nome`, `categoria_id` (FK), `preco`, `preco_antigo`, `cor`, `descricao`, `em_oferta`, `imagem_url`
- **Storage bucket `fotos`:** público para leitura; escrita só para usuários autenticados
- **RLS:** leitura pública (anon) para loja; escrita apenas para usuários logados (painel)
- **Auth:** usuário criado em Authentication → Users (e-mail + senha)

### Configuração (já feita)

- `js/config.js`: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (chave pública, segura) e `NUMERO_WHATSAPP`
- `supabase/setup.sql`: executado no SQL Editor do Supabase

## Painel administrativo

Acessar `admin.html` (na loja publicada, ficará em `https://site.vercel.app/admin.html`).

- **Login:** e-mail + senha criada no Supabase (Authentication → Users)
- **Aba Categorias:** criar, renomear e excluir categorias (excluir remove os produtos da categoria)
- **Aba Produtos:** criar, editar e excluir produtos
  - Campos: nome, categoria, preço, preço antigo, descrição, cor de destaque, "em oferta", foto
  - **Foto:** selecionar arquivo → upload automático para o storage → link público salvo
- Botão **Ver site** para abrir a loja

## WhatsApp

- Número em `js/config.js` (`NUMERO_WHATSAPP`, formato internacional sem `+`)
- Todos os botões (card, modal, cabeçalho, rodapé, flutuante) apontam para `wa.me/<numero>`
- Cada produto gera mensagem pré-preenchida com nome, categoria e preço

## Deploy

- **GitHub:** repositório `guilherme-crepardi/monica-modas-e-variedades`
- **Vercel:** deploy automático a partir do `main` do GitHub

### Como publicar alterações de código

```
git add .
git commit -m "descrição da mudança"
git push
```

O Vercel atualiza sozinho (~1 min). Alterações de produtos/fotos feitas pelo painel **não exigem deploy** — já valem na hora.

## Funcionalidades

- Vitrine responsiva em grid
- Busca por nome/categoria + filtros por categoria (dinâmicos, vindos do banco) + "Só Ofertas"
- Modal de detalhes (foto, preço, parcelamento 3x, descrição, botão WhatsApp)
- Selo "Oferta" para `em_oferta: true`
- Placeholder SVG automático para produtos sem foto
- Painel administrativo com login e upload de fotos
- Toast de confirmação e newsletter

## Manutenção comum

- **Loja sem produtos:** conferir se `supabase/setup.sql` foi executado e se `js/config.js` tem a URL e anon key corretas.
- **Foto não aparece:** conferir `imagem_url` (pode ser caminho relativo `fotos/...` ou URL pública do storage `https://<projeto>.supabase.co/storage/v1/object/public/fotos/...`).
- **Painel não loga:** conferir se o usuário existe em Authentication → Users e se a senha está correta.
- **Alterações no banco não aparecem na loja:** atualizar a página (F5).
