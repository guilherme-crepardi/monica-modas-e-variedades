(async function () {
  "use strict";

  const ICONES = {
    feminino: "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z",
    masculino: "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z",
    infantil: "M8 13V5.5a1.5 1.5 0 0 1 3 0V11 M13 13V5.5a1.5 1.5 0 0 1 3 0V11 M4 20h16a2 2 0 0 0 2-2v-4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v4a2 2 0 0 0 2 2Z",
    calcados: "M3 15c4 1 8 2 10.5-1.5C15.5 11 17.5 9.5 20 9c2 .5 2.5 1.5 2 3-.5 2-3 4-7 5.5C10.7 19 6 19.5 3 17.5c0-1 .5-2 0-2.5Z",
    bolsas: "M8.5 9V7a3.5 3.5 0 0 1 7 0v2 M5 8h14l-1 13H6L5 8Z",
    variedades: "M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  };
  const ICONE_PADRAO = "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z";
  const CORES = {
    feminino: "#e75480",
    masculino: "#4a6fa5",
    infantil: "#f29a4a",
    calcados: "#7d5a8c",
    bolsas: "#a0507a",
    variedades: "#4f9d8f",
  };

  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const grids = document.getElementById("products-grid");
  const noResults = document.getElementById("no-results");
  const countEl = document.getElementById("products-count");
  const titleEl = document.getElementById("products-title");
  const toastEl = document.getElementById("toast");
  const modalEl = document.getElementById("product-modal");
  const modalBody = document.getElementById("modal-body");
  const searchInput = document.getElementById("search-input");
  const searchForm = document.getElementById("search-form");
  const navDinamico = document.getElementById("nav-dinamico");
  const categoriasGrid = document.getElementById("categories-grid");
  const filtersWrap = document.getElementById("products-filters");

  let supabase;
  let categorias = [];
  let produtos = [];
  let filtroAtual = "todos";
  let buscaAtual = "";
  let lastToastTimer = null;

  function iniciarClient() {
    if (!window.supabase) throw new Error("supabase-js não carregou");
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async function carregarDados() {
    const { data: cats, error: errC } = await supabase
      .from("categorias")
      .select("id, nome, slug")
      .order("ordem");
    if (errC) throw errC;

    const { data: prods, error: errP } = await supabase
      .from("produtos")
      .select("*, categorias(nome, slug)")
      .order("criado_em");
    if (errP) throw errP;

    categorias = cats || [];
    produtos = (prods || []).map(function (p) {
      const cat = p.categorias || {};
      return {
        id: p.id,
        nome: p.nome,
        categoria: cat.slug || "",
        nomeCategoria: cat.nome || "Sem categoria",
        preco: Number(p.preco) || 0,
        precoAntigo: p.preco_antigo != null ? Number(p.preco_antigo) : null,
        cor: p.cor || CORES[cat.slug] || "#e75480",
        descricao: p.descricao || "",
        emOferta: !!p.em_oferta,
        imagem: p.imagem_url || "",
      };
    });
  }

  function codificarSVG(texto) {
    return encodeURIComponent(texto).replace(/%20/g, " ");
  }

  function imagemProduto(p) {
    if (p.imagem) return p.imagem;
    const fundo = "#f2f2f4";
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#ffffff"/>' +
      '<stop offset="1" stop-color="' + fundo + '"/></linearGradient></defs>' +
      '<rect width="600" height="600" fill="url(#g)"/>' +
      '<circle cx="300" cy="300" r="150" fill="rgba(255,255,255,0.55)"/>' +
      '<g transform="translate(300 300) scale(3.2)" fill="none" stroke="' + p.cor + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="' + (ICONES[p.categoria] || ICONE_PADRAO) + '"/></g>' +
      '<text x="300" y="540" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="700" fill="#555" text-anchor="middle">' +
      p.nome + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + codificarSVG(svg);
  }

  function linkWhatsApp(p) {
    const msg =
      "Olá! Tenho interesse no produto *" + p.nome +
      "* (" + p.nomeCategoria + ") no valor de " +
      formatarPreco(p.preco) + ". Vocês têm disponível?";
    return "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(msg);
  }

  function formatarPreco(valor) {
    return brl.format(valor);
  }

  function nomeCategoriaAtual() {
    if (buscaAtual) return "Resultados da busca";
    if (filtroAtual === "todos") return "Destaques";
    if (filtroAtual === "ofertas") return "Ofertas";
    const c = categorias.find(function (x) { return x.slug === filtroAtual; });
    return c ? c.nome : "Destaques";
  }

  function produtosFiltrados() {
    let lista = produtos.slice();
    if (filtroAtual === "ofertas") {
      lista = lista.filter(function (p) { return p.emOferta; });
    } else if (filtroAtual !== "todos") {
      lista = lista.filter(function (p) { return p.categoria === filtroAtual; });
    }
    if (buscaAtual) {
      const b = buscaAtual.trim().toLowerCase();
      lista = lista.filter(function (p) {
        return p.nome.toLowerCase().indexOf(b) !== -1 ||
          p.nomeCategoria.toLowerCase().indexOf(b) !== -1;
      });
    }
    return lista;
  }

  function renderizarCategorias() {
    navDinamico.innerHTML = categorias.map(function (c) {
      return '<button class="nav-link" data-categoria="' + c.slug + '">' + c.nome + "</button>";
    }).join("");

    categoriasGrid.innerHTML = categorias.map(function (c) {
      const cor = CORES[c.slug] || "#e75480";
      return '<button class="category-card" data-categoria="' + c.slug + '">' +
        '<span class="category-icon" style="--cat:' + cor + '">' +
        '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="' + (ICONES[c.slug] || ICONE_PADRAO) + '"/></svg></span>' +
        "<strong>" + c.nome + "</strong></button>";
    }).join("");

    filtersWrap.innerHTML =
      '<button class="filter-chip active" data-categoria="todos">Todos</button>' +
      categorias.map(function (c) {
        return '<button class="filter-chip" data-categoria="' + c.slug + '">' + c.nome + "</button>";
      }).join("") +
      '<button class="filter-chip chip-oferta" data-categoria="ofertas">Só Ofertas</button>';
  }

  function renderizar() {
    const lista = produtosFiltrados();
    grids.innerHTML = "";

    if (lista.length === 0) {
      noResults.hidden = false;
      countEl.textContent = "";
      return;
    }
    noResults.hidden = true;
    titleEl.textContent = nomeCategoriaAtual();
    countEl.textContent = lista.length + (lista.length === 1 ? " produto" : " produtos");

    lista.forEach(function (p, i) {
      const card = document.createElement("article");
      card.className = "product-card";
      card.style.animationDelay = Math.min(i * 40, 400) + "ms";

      const precoParcela = p.preco / 3;
      let badges = "";
      if (p.emOferta) badges += '<span class="badge badge-oferta">Oferta</span>';

      card.innerHTML =
        '<div class="product-image">' +
          (badges ? '<div class="product-badges">' + badges + "</div>" : "") +
          '<img src="' + imagemProduto(p) + '" alt="' + p.nome + '" loading="lazy" />' +
        "</div>" +
        '<div class="product-body">' +
          '<span class="product-cat">' + p.nomeCategoria + "</span>" +
          '<h3 class="product-name">' + p.nome + "</h3>" +
          '<div class="product-prices">' +
            (p.precoAntigo ? '<span class="price-old">' + formatarPreco(p.precoAntigo) + "</span>" : "") +
            '<span class="price-current"><span class="currency">R$</span> ' +
              p.preco.toFixed(2).replace(".", ",") + "</span>" +
            '<span class="price-installment">em até 3x de <strong>' + formatarPreco(precoParcela) + "</strong> sem juros</span>" +
          "</div>" +
          '<button class="btn-detail" data-id="' + p.id + '">Ver produto</button>' +
        "</div>";

      grids.appendChild(card);
    });

    grids.querySelectorAll(".btn-detail").forEach(function (btn) {
      btn.addEventListener("click", function () { abrirModal(String(btn.dataset.id)); });
    });
  }

  function abrirModal(id) {
    const p = produtos.find(function (x) { return x.id === id; });
    if (!p) return;
    const precoParcela = p.preco / 3;
    modalBody.innerHTML =
      '<div class="modal-image">' +
        '<img src="' + imagemProduto(p) + '" alt="' + p.nome + '" />' +
      "</div>" +
      '<div class="modal-info">' +
        '<span class="product-cat">' + p.nomeCategoria + "</span>" +
        "<h3 id='modal-title'>" + p.nome + "</h3>" +
        '<p class="modal-desc">' + p.descricao + "</p>" +
        '<div class="modal-prices">' +
          (p.precoAntigo ? '<span class="price-old">' + formatarPreco(p.precoAntigo) + "</span>" : "") +
          '<span class="price-current"><span class="currency">R$</span> ' +
            p.preco.toFixed(2).replace(".", ",") + "</span>" +
          '<span class="price-installment">em até 3x de <strong>' + formatarPreco(precoParcela) + "</strong> sem juros</span>" +
        "</div>" +
        '<div class="modal-actions">' +
          '<a class="btn btn-whats btn-lg" href="' + linkWhatsApp(p) + '" target="_blank" rel="noopener">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.83 14.12c-.25.7-1.45 1.33-2.02 1.42-.52.08-1.17.11-1.89-.12-.44-.14-1-.33-1.71-.65-3.02-1.31-5-4.36-5.15-4.56-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.61-.38.81-.38.2 0 .41 0 .58.01.19.01.44-.07.68.52.25.6.84 2.05.92 2.2.07.15.12.33.02.53-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.35 1.45.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.65-.15.27.1 1.69.8 1.98.94.29.15.49.22.56.34.07.12.07.7-.18 1.4Z"/></svg>' +
            "Pedir pelo WhatsApp</a>" +
          '<span class="installments-note">Atendimento rápido pelo WhatsApp. Enviamos para todo o Brasil.</span>' +
        "</div>" +
      "</div>";
    modalEl.classList.add("open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function fecharModal() {
    modalEl.classList.remove("open");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setarFiltro(cat) {
    filtroAtual = cat;
    buscaAtual = "";
    searchInput.value = "";
    document.querySelectorAll(".filter-chip").forEach(function (c) {
      c.classList.toggle("active", c.dataset.categoria === cat);
    });
    document.querySelectorAll(".nav-link").forEach(function (c) {
      c.classList.toggle("active", c.dataset.categoria === cat);
    });
    renderizar();
    document.getElementById("produtos").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function mostrarToast(msg, erro) {
    clearTimeout(lastToastTimer);
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (erro ? " error" : "");
    lastToastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 4000);
  }

  function configurarEventos() {
    document.querySelectorAll(".nav-link, .filter-chip, .category-card").forEach(function (btn) {
      btn.addEventListener("click", function () { setarFiltro(btn.dataset.categoria); });
    });

    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      buscaAtual = searchInput.value.trim();
      if (buscaAtual) {
        filtroAtual = "todos";
        document.querySelectorAll(".filter-chip").forEach(function (c) {
          c.classList.toggle("active", c.dataset.categoria === "todos");
        });
      }
      renderizar();
      document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
    });

    searchInput.addEventListener("input", function () {
      if (searchInput.value.trim() === "") {
        buscaAtual = "";
        renderizar();
      }
    });

    modalEl.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", fecharModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fecharModal();
    });

    const formNews = document.getElementById("newsletter-form");
    formNews.addEventListener("submit", function (e) {
      e.preventDefault();
      formNews.reset();
      mostrarToast("Cadastro realizado! Em breve você recebe nossas novidades.");
    });

    const waBase = "https://wa.me/" + NUMERO_WHATSAPP;
    document.querySelectorAll("[id^='link-whatsapp']").forEach(function (a) {
      let msg = "Olá! Gostaria de saber mais sobre os produtos da loja.";
      if (a.id === "link-whatsapp-social" || a.id === "link-whatsapp-footer") {
        msg = "Olá! Vim pelo site da Monica Modas e Variedades e quero saber mais.";
      }
      a.href = waBase + "?text=" + encodeURIComponent(msg);
    });

    const floatBtn = document.createElement("a");
    floatBtn.className = "float-whats";
    floatBtn.href = waBase + "?text=" + encodeURIComponent("Olá! Vim pelo site da Monica Modas e Variedades e quero saber mais.");
    floatBtn.target = "_blank";
    floatBtn.rel = "noopener";
    floatBtn.setAttribute("aria-label", "Conversar no WhatsApp");
    floatBtn.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.83 14.12c-.25.7-1.45 1.33-2.02 1.42-.52.08-1.17.11-1.89-.12-.44-.14-1-.33-1.71-.65-3.02-1.31-5-4.36-5.15-4.56-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.61-.38.81-.38.2 0 .41 0 .58.01.19.01.44-.07.68.52.25.6.84 2.05.92 2.2.07.15.12.33.02.53-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.35 1.45.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.65-.15.27.1 1.69.8 1.98.94.29.15.49.22.56.34.07.12.07.7-.18 1.4Z"/></svg>';
    document.body.appendChild(floatBtn);

    document.getElementById("year").textContent = new Date().getFullYear();
  }

  try {
    iniciarClient();
    await carregarDados();
    renderizarCategorias();
    configurarEventos();
    renderizar();
  } catch (erro) {
    console.error(erro);
    grids.innerHTML = '<p class="no-results">Não foi possível carregar os produtos. Verifique a conexão com o Supabase.</p>';
  }
})();
