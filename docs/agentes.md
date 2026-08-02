# Monica Modas e Variedades — Documentação do Projeto

## Visão geral

Site catálogo (vitrine) para a loja **Monica Modas e Variedades**, inspirado visualmente na Zattini. O objetivo é exibir os produtos com fotos e preços; a compra é feita pelo WhatsApp. Não há carrinho nem checkout.

## Arquitetura

Site 100% estático (HTML/CSS/JS puro). Não requer servidor, build nem instalação — basta abrir o `index.html`.

```
raiz/
├── index.html          → estrutura da página (header, hero, categorias, produtos, rodapé)
├── css/
│   └── style.css       → todo o visual (cores, grid, responsividade, modal, toast)
├── js/
│   ├── produtos.js     → dados dos produtos (catálogo) + número do WhatsApp
│   └── app.js          → lógica: renderização, busca, filtros, modal, links WhatsApp
├── fotos/              → fotos reais dos produtos (criar com imagem: "fotos/arquivo.jpg")
└── docs/
    └── agentes.md      → este documento
```

### Fluxo de dados

1. `produtos.js` define a constante global `produtos` (array de objetos) e `NUMERO_WHATSAPP`.
2. `app.js` lê `produtos`, renderiza os cards no `#products-grid` e conecta busca, filtros e modal.
3. Se o produto não tiver campo `imagem`, o `app.js` gera automaticamente uma imagem SVG placeholder (data URI) com ícone da categoria e nome do produto.

## Como adicionar produtos

Editar `js/produtos.js`, colando um novo bloco antes da linha final `];`.

Campos obrigatórios:

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | number | Número único, nunca repetido |
| `nome` | string | Nome do produto |
| `categoria` | string | Uma de: `feminino`, `masculino`, `infantil`, `calcados`, `bolsas`, `variedades` |
| `preco` | number | Preço atual |
| `cor` | string | Cor usada no placeholder SVG (se não houver imagem) |
| `descricao` | string | Texto exibido no modal |
| `emOferta` | boolean | `true` mostra o selo "Oferta" e entra no filtro "Ofertas" |

Campos opcionais:

| Campo | Tipo | Descrição |
|---|---|---|
| `precoAntigo` | number | Preço antigo riscado (mostra o desconto) |
| `imagem` | string | Caminho da foto real, ex.: `"fotos/bolsa-festa.jpg"` |

Regras de sintaxe importantes (quebram o site se erradas):

- Todo bloco termina com `},` (vírgula). Só o **último** produto do array termina com `}` sem vírgula, antes de `];`.
- Caminho de imagem é **relativo** (`fotos/arquivo.jpg`), nunca use caminho absoluto do Windows (`C:\...`).
- O nome do arquivo em `imagem` deve ser idêntico ao arquivo na pasta `fotos/` (maiúsculas, espaços, acentos contam).

## Trocar fotos

1. Copiar a foto para a pasta `fotos/`.
2. Adicionar/editar o campo `imagem` do produto: `imagem: "fotos/nome-do-arquivo.jpg"`.
3. Recarregar a página (`F5`).

## WhatsApp

- Número configurado em `js/produtos.js` na constante `NUMERO_WHATSAPP` (formato internacional sem `+`).
- Todos os botões (card, modal, cabeçalho, rodapé, botão flutuante) apontam para `wa.me/<numero>`.
- Cada produto gera uma mensagem pré-preenchida com nome, categoria e preço.

## Funcionalidades (features atuais)

- Vitrine de produtos em grid responsivo (4 colunas → 3 → 2 no celular).
- Busca por nome ou categoria (campo de busca no cabeçalho).
- Filtros por categoria (menu de navegação, chips e cards de categoria) + filtro "Só Ofertas".
- Modal de detalhes do produto (foto, preço, parcelamento 3x, descrição, botão WhatsApp).
- Selos de "Oferta" nos produtos com `emOferta: true`.
- Parcelamento exibido como "3x sem juros" calculado automaticamente sobre o preço.
- Placeholder SVG automático para produtos sem foto real.
- Seções: topbar de promoção, header com busca, hero, benefícios, categorias, produtos, banner de cupom (MONICA10), newsletter, rodapé.
- Toast de confirmação (ex.: cadastro na newsletter).
- Responsivo (mobile-first breakpoints em `css/style.css`).

## Manutenção comum

- Erro "nada aparece no site" → provavelmente quebrou a sintaxe de `js/produtos.js`. Verificar vírgulas nos blocos.
- Erro no `F5` após trocar foto → conferir se o arquivo existe em `fotos/` com o nome exato informado no campo `imagem`.
