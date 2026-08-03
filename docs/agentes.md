# Monica Modas e Variedades — Documentação do Projeto

## Visão geral

Site catálogo (vitrine) para a loja **Monica Modas e Variedades**, inspirado visualmente na Zattini. Exibe os produtos com fotos e preços; a compra é feita pelo WhatsApp. Não há carrinho nem checkout.

Os dados (produtos e categorias) ficam no **Supabase** e são gerenciados pelo **painel administrativo** (`admin.html`) — não é mais necessário editar código para adicionar produtos ou fotos.

**Textos atuais da loja:** topbar com "Parcele em até 3x sem juros". Não há mais referências a frete na página. O antigo banner de cupom "Ganhe 10% OFF / MONICA10" foi removido.

## Arquitetura

Site estático (HTML/CSS/JS puro) hospedado na **Vercel**, com **Supabase** como banco de dados e armazenamento de fotos.

```
raiz/
├── index.html          → loja pública (sem login)
├── admin.html          → painel administrativo (com login)
├── favicon.svg         → favicon vetorial da logo "M"
├── favicon.png         → favicon PNG (compatibilidade)
├── css/
│   ├── style.css       → visual da loja
│   └── admin.css       → visual do painel
├── js/
│   ├── config.js       → URL do Supabase, anon key e número do WhatsApp
│   ├── app.js          → loja: carrega dados do Supabase e renderiza
│   └── admin.js        → painel: login, CRUD de categorias/produtos, upload
├── supabase/
│   ├── setup.sql           → cria tabelas, RLS, storage e produtos iniciais
│   ├── seguranca.sql       → bloqueia escrita só para o e-mail do admin
│   └── remover_infantil.sql → remove a categoria Infantil e reordena as demais
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
- **Storage bucket `fotos`:** público para leitura; escrita só para o e-mail do admin
- **RLS:** leitura pública (anon) para loja; **escrita apenas para o e-mail `mastertecheletronica15@gmail.com`** (policy restringe `auth.jwt() ->> 'email'`). Outros usuários logados não conseguem alterar nada.
- **Cadastro aberto desligado:** em Authentication → Providers → Email → "Allow new users to sign up" está desativado. Só quem você criar em Authentication → Users entra.
- **Auth:** usuário criado em Authentication → Users (e-mail + senha). Usuário ativo: `mastertecheletronica15@gmail.com` (senha definida no Supabase, não armazenada em docs por segurança)
- **Scripts SQL:** `setup.sql` (inicial), `seguranca.sql` (bloqueio por e-mail) e `remover_infantil.sql` (limpeza da categoria infantil). Rode no SQL Editor do Supabase.

### Configuração (já feita)

- `js/config.js`: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (chave pública, segura) e `NUMERO_WHATSAPP`
- `supabase/setup.sql`: executado no SQL Editor do Supabase

## Painel administrativo

Acessar `admin.html` (na loja publicada: `https://monica-modas-e-variedades.vercel.app/admin.html`).

- **Login:** e-mail + senha criada no Supabase (Authentication → Users)
- **Aba Categorias:** criar, renomear e excluir categorias (excluir remove os produtos da categoria)
- **Aba Produtos:** criar, editar e excluir produtos
  - Campos: nome, categoria, preço, preço antigo, descrição, cor de destaque, "em oferta", foto
  - **Foto:** selecionar arquivo → upload automático para o storage → link público salvo
- Botão **Ver site** para abrir a loja

## WhatsApp

- Número em `js/config.js` (`NUMERO_WHATSAPP = "5511940168045"`, formato internacional sem `+`)
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

- Vitrine responsiva em grid (imagem do card em formato retrato 3:4, preenchendo o card)
- Busca por nome/categoria + filtros por categoria (dinâmicos, vindos do banco) + "Só Ofertas"
- Modal de detalhes (foto, preço, parcelamento 3x, descrição, botão WhatsApp)
- Selo "Oferta" para `em_oferta: true`
- Placeholder SVG automático para produtos sem foto
- **Fundo da vitrine por categoria:** rosa em Feminino, azul em Masculino, branco nas demais (transição suave)
- **Filtro fixo que minimiza ao rolar:** a barra de título/filtros gruda abaixo das categorias e colapsa ao rolar para baixo, expandindo ao voltar ao topo
- **Barra de categorias sempre no topo:** no celular fica fixa no topo da tela (só ela); no desktop o header + categorias ficam juntos fixos
- **Responsividade total:** celular, tablet e desktop; filtros viram linha com rolagem lateral no mobile; ajustes finos em telas de 480px/380px
- **Favicon com a logo "M"** (SVG + PNG) no site e no painel
- Painel administrativo com login e upload de fotos
- Toast de confirmação e newsletter
- Topbar com "Parcele em até 3x sem juros" (sem menção a frete)

## Últimas alterações

**Identidade e favicon**
- Criado favicon com a logo "M" rosa (`favicon.svg` + `favicon.png`) e adicionado `<link rel="icon">` no `index.html` e `admin.html`
- Ícone do botão de busca trocado pela logo "M" da loja

**Segurança**
- Restrita a escrita do painel **só para o e-mail do admin**: policies de `categorias`, `produtos` e storage passaram a verificar `auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com'` (`supabase/seguranca.sql`)
- Cadastro aberto desligado no Supabase (ninguém cria conta para entrar)

**Conteúdo**
- Removida a categoria **Infantil** (seed, ícones, cores e banco via `supabase/remover_infantil.sql`)
- Removidas todas as referências a **frete/entrega** (topbar, benefícios e rodapé)
- Topbar final: "Parcele em até 3x sem juros"

**Visual e experiência**
- Fundo da vitrine muda conforme a categoria: rosa em Feminino, azul em Masculino, branco nas demais
- Filtro fixo que minimiza ao rolar a página (colapsa em barra compacta)
- Responsividade para todas as plataformas (celular/tablet/desktop)
- Corrigido bug da barra de categorias no celular: o `<nav>` saiu de dentro do `<header>` (era esse o motivo do `position: sticky` não funcionar e a barra ficar no meio da tela) — agora a barra de categorias fica fixa no topo no celular; no desktop header + categorias ficam juntos no topo
- Botões das categorias numa única linha com rolagem lateral no mobile (antes quebravam em 3 linhas)

**Histórico anterior**
- Integração com Supabase (banco + storage + painel admin)
- Categorias dinâmicas vindas do banco
- Removido o banner "Ganhe 10% OFF / cupom MONICA10"
- Corrigido o bug de clique nas categorias (renderização antes dos eventos)
- Número do WhatsApp atualizado para `5511940168045`
- Cartões de produto em formato retrato 3:4

## Manutenção comum

- **Loja sem produtos:** conferir se `supabase/setup.sql` foi executado e se `js/config.js` tem a URL e anon key corretas.
- **Foto não aparece:** conferir `imagem_url` (pode ser caminho relativo `fotos/...` ou URL pública do storage `https://<projeto>.supabase.co/storage/v1/object/public/fotos/...`).
- **Painel não loga:** conferir se o usuário existe em Authentication → Users e se a senha está correta.
- **Painel aceitando alterações de qualquer pessoa:** verificar se `supabase/seguranca.sql` foi rodado e se o "Allow new users to sign up" está desligado.
- **Dar acesso a outra pessoa:** em Authentication → Users crie o novo usuário e troque o e-mail nas policies do `seguranca.sql` (ou crie um novo script).
- **Alterações no banco não aparecem na loja:** atualizar a página (F5).
- **Barra de categorias com problema no celular:** ela depende do `<nav>` estar fora do `<header>` no `index.html` e do JS setar `--nav-top`/`--filter-top`.
