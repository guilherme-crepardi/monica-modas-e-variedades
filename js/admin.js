(async function () {
  "use strict";

  if (!window.supabase) throw new Error("supabase-js não carregou");
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const loginView = document.getElementById("login-view");
  const dashView = document.getElementById("dashboard-view");
  const headerActions = document.getElementById("header-actions");
  const toastEl = document.getElementById("toast");

  const loginForm = document.getElementById("login-form");
  const loginMsg = document.getElementById("login-msg");
  const loginBtn = document.getElementById("login-submit");

  const btnLogout = document.getElementById("btn-logout");

  const catsList = document.getElementById("categorias-list");
  const prodsList = document.getElementById("produtos-list");

  const catForm = document.getElementById("categoria-form");
  const catNome = document.getElementById("cat-nome");
  const catSlug = document.getElementById("cat-slug");
  const catTitle = document.getElementById("cat-title");
  const catCancelar = document.getElementById("cat-cancelar");

  const prodForm = document.getElementById("produto-form");
  const prodNome = document.getElementById("prod-nome");
  const prodCategoria = document.getElementById("prod-categoria");
  const prodPreco = document.getElementById("prod-preco");
  const prodPrecoAntigo = document.getElementById("prod-preco-antigo");
  const prodDescricao = document.getElementById("prod-descricao");
  const prodCor = document.getElementById("prod-cor");
  const prodOferta = document.getElementById("prod-oferta");
  const prodImagem = document.getElementById("prod-imagem");
  const prodPreview = document.getElementById("prod-preview");
  const prodTitle = document.getElementById("prod-title");
  const prodCancelar = document.getElementById("prod-cancelar");

  let categorias = [];
  let produtos = [];
  let categoriaEditando = null;
  let produtoEditando = null;
  let arquivoImagem = null;
  let imagemAtual = "";

  let lastToastTimer = null;

  function toast(msg, erro) {
    clearTimeout(lastToastTimer);
    toastEl.textContent = msg;
    toastEl.className = "toast show" + (erro ? " error" : "");
    lastToastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 4000);
  }

  function brl(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function slugificar(texto) {
    return texto.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  catNome.addEventListener("input", function () {
    if (!catSlug.value || categoriaEditando === null) catSlug.value = slugificar(catNome.value);
  });

  async function carregarCategorias() {
    const { data, error } = await supabase.from("categorias").select("id, nome, slug, ordem").order("ordem");
    if (error) throw error;
    categorias = data || [];
    renderCategorias();
  }

  function renderCategorias() {
    catsList.innerHTML = "";
    if (!categorias.length) {
      catsList.innerHTML = '<p class="admin-empty">Nenhuma categoria ainda.</p>';
      return;
    }
    categorias.forEach(function (c) {
      const li = document.createElement("li");
      li.className = "admin-list-item";
      li.innerHTML =
        '<div class="info"><strong>' + c.nome + '</strong><span>slug: ' + c.slug + "</span></div>" +
        '<div class="actions">' +
          '<button class="admin-btn-sm admin-btn-edit" data-edit-cat="' + c.id + '">Editar</button>' +
          '<button class="admin-btn-sm admin-btn-del" data-del-cat="' + c.id + '">Excluir</button>' +
        "</div>";
      catsList.appendChild(li);
    });
    catsList.querySelectorAll("[data-edit-cat]").forEach(function (b) {
      b.addEventListener("click", function () { editarCategoria(b.dataset.editCat); });
    });
    catsList.querySelectorAll("[data-del-cat]").forEach(function (b) {
      b.addEventListener("click", function () { deletarCategoria(b.dataset.delCat); });
    });
  }

  function editarCategoria(id) {
    const c = categorias.find(function (x) { return x.id === id; });
    if (!c) return;
    categoriaEditando = c.id;
    catNome.value = c.nome;
    catSlug.value = c.slug;
    catTitle.textContent = "Editar categoria";
    catCancelar.hidden = false;
    dashView.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelarCategoria() {
    categoriaEditando = null;
    catForm.reset();
    catTitle.textContent = "Nova categoria";
    catCancelar.hidden = true;
  }

  async function salvarCategoria(e) {
    e.preventDefault();
    const nome = catNome.value.trim();
    const slug = slugificar(catSlug.value.trim());
    if (!nome || !slug) return toast("Preencha nome e slug.", true);

    if (categoriaEditando) {
      const { error } = await supabase.from("categorias").update({ nome: nome, slug: slug }).eq("id", categoriaEditando);
      if (error) return toast("Erro ao salvar: " + error.message, true);
      toast("Categoria atualizada!");
    } else {
      const { data, error } = await supabase.from("categorias").insert({ nome: nome, slug: slug });
      if (error) return toast("Erro ao criar: " + error.message, true);
      if (data && data.length) toast("Categoria criada!");
    }
    cancelarCategoria();
    await carregarCategorias();
  }

  async function deletarCategoria(id) {
    const c = categorias.find(function (x) { return x.id === id; });
    const confirma = confirm("Excluir a categoria \"" + (c ? c.nome : "") + "\"?\nOs produtos desta categoria também serão excluídos.");
    if (!confirma) return;
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) return toast("Erro ao excluir: " + error.message, true);
    toast("Categoria excluída.");
    await carregarCategorias();
    await carregarProdutos();
  }

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*, categorias(nome, slug)")
      .order("criado_em", { ascending: false });
    if (error) throw error;
    produtos = data || [];
    renderProdutos();
  }

  function renderProdutos() {
    prodsList.innerHTML = "";
    if (!produtos.length) {
      prodsList.innerHTML = '<p class="admin-empty">Nenhum produto ainda.</p>';
      return;
    }
    produtos.forEach(function (p) {
      const cat = p.categorias || {};
      const thumb = p.imagem_url
        ? '<img src="' + p.imagem_url + '" alt="" />'
        : '<img src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f2f2f4"/><circle cx="50" cy="50" r="22" fill="#e0e0e6"/></svg>') + '" alt="" />';
      const item = document.createElement("div");
      item.className = "admin-list-item";
      item.innerHTML =
        thumb +
        '<div class="info"><strong>' + p.nome + '</strong><span>' + (cat.nome || "Sem categoria") + " · " + brl(p.preco) + (p.em_oferta ? " · OFERTA" : "") + "</span></div>" +
        '<div class="actions">' +
          '<button class="admin-btn-sm admin-btn-edit" data-edit-prod="' + p.id + '">Editar</button>' +
          '<button class="admin-btn-sm admin-btn-del" data-del-prod="' + p.id + '">Excluir</button>' +
        "</div>";
      prodsList.appendChild(item);
    });
    prodsList.querySelectorAll("[data-edit-prod]").forEach(function (b) {
      b.addEventListener("click", function () { editarProduto(b.dataset.editProd); });
    });
    prodsList.querySelectorAll("[data-del-prod]").forEach(function (b) {
      b.addEventListener("click", function () { deletarProduto(b.dataset.delProd); });
    });
  }

  function preencherSelectCategorias(selecionado) {
    prodCategoria.innerHTML = '<option value="">Selecione...</option>' + categorias.map(function (c) {
      const sel = c.id === selecionado ? " selected" : "";
      return '<option value="' + c.id + '"' + sel + ">" + c.nome + "</option>";
    }).join("");
  }

  function editarProduto(id) {
    const p = produtos.find(function (x) { return x.id === id; });
    if (!p) return;
    produtoEditando = p.id;
    prodNome.value = p.nome;
    preencherSelectCategorias(p.categoria_id);
    prodPreco.value = p.preco;
    prodPrecoAntigo.value = p.preco_antigo != null ? p.preco_antigo : "";
    prodDescricao.value = p.descricao || "";
    prodCor.value = p.cor || "#e75480";
    prodOferta.checked = !!p.em_oferta;
    imagemAtual = p.imagem_url || "";
    arquivoImagem = null;
    prodImagem.value = "";
    prodPreview.innerHTML = imagemAtual ? '<img src="' + imagemAtual + '" alt="Prévia" />' : "";
    prodTitle.textContent = "Editar produto";
    prodCancelar.hidden = false;
    dashView.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelarProduto() {
    produtoEditando = null;
    arquivoImagem = null;
    imagemAtual = "";
    prodForm.reset();
    prodPreview.innerHTML = "";
    preencherSelectCategorias(null);
    prodTitle.textContent = "Novo produto";
    prodCancelar.hidden = true;
  }

  prodImagem.addEventListener("change", function () {
    arquivoImagem = prodImagem.files.length ? prodImagem.files[0] : null;
    if (arquivoImagem) {
      const url = URL.createObjectURL(arquivoImagem);
      prodPreview.innerHTML = '<img src="' + url + '" alt="Prévia" />';
    } else if (imagemAtual) {
      prodPreview.innerHTML = '<img src="' + imagemAtual + '" alt="Prévia" />';
    } else {
      prodPreview.innerHTML = "";
    }
  });

  async function fazerUpload(foto) {
    const nome = Date.now() + "-" + foto.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const { error } = await supabase.storage.from("fotos").upload(nome, foto, { upsert: true });
    if (error) throw error;
    return supabase.storage.from("fotos").getPublicUrl(nome).data.publicUrl;
  }

  async function salvarProduto(e) {
    e.preventDefault();
    const nome = prodNome.value.trim();
    const categoriaId = prodCategoria.value;
    const preco = parseFloat(prodPreco.value);
    if (!nome || !categoriaId || isNaN(preco)) return toast("Preencha nome, categoria e preço.", true);

    let imagemUrl = imagemAtual;
    if (arquivoImagem) {
      try {
        imagemUrl = await fazerUpload(arquivoImagem);
      } catch (err) {
        return toast("Erro no upload da foto: " + err.message, true);
      }
    }

    const dados = {
      nome: nome,
      categoria_id: categoriaId,
      preco: preco,
      preco_antigo: prodPrecoAntigo.value ? parseFloat(prodPrecoAntigo.value) : null,
      descricao: prodDescricao.value.trim(),
      cor: prodCor.value,
      em_oferta: prodOferta.checked,
      imagem_url: imagemUrl || null,
    };

    if (produtoEditando) {
      const { error } = await supabase.from("produtos").update(dados).eq("id", produtoEditando);
      if (error) return toast("Erro ao salvar: " + error.message, true);
      toast("Produto atualizado!");
    } else {
      const { error } = await supabase.from("produtos").insert(dados);
      if (error) return toast("Erro ao criar: " + error.message, true);
      toast("Produto criado!");
    }
    cancelarProduto();
    await carregarProdutos();
  }

  async function deletarProduto(id) {
    const confirma = confirm("Excluir este produto?");
    if (!confirma) return;
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) return toast("Erro ao excluir: " + error.message, true);
    toast("Produto excluído.");
    await carregarProdutos();
  }

  document.querySelectorAll(".admin-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".admin-tab").forEach(function (t) { t.classList.toggle("active", t === tab); });
      document.getElementById("tab-categorias").hidden = tab.dataset.tab !== "categorias";
      document.getElementById("tab-produtos").hidden = tab.dataset.tab !== "produtos";
    });
  });

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    loginMsg.textContent = "";
    loginMsg.className = "admin-msg";
    loginBtn.disabled = true;
    loginBtn.textContent = "Entrando...";
    const { error } = await supabase.auth.signInWithPassword({
      email: document.getElementById("login-email").value.trim(),
      password: document.getElementById("login-password").value,
    });
    loginBtn.disabled = false;
    loginBtn.textContent = "Entrar";
    if (error) {
      loginMsg.textContent = "E-mail ou senha incorretos.";
      loginMsg.className = "admin-msg error";
      return;
    }
    loginForm.reset();
    await atualizarUI();
    toast("Bem-vindo(a)!");
  });

  btnLogout.addEventListener("click", async function () {
    await supabase.auth.signOut();
    await atualizarUI();
  });

  catForm.addEventListener("submit", salvarCategoria);
  catCancelar.addEventListener("click", cancelarCategoria);
  prodForm.addEventListener("submit", salvarProduto);
  prodCancelar.addEventListener("click", cancelarProduto);

  async function atualizarUI() {
    const { data } = await supabase.auth.getSession();
    const logado = !!data.session;
    loginView.hidden = logado;
    dashView.hidden = !logado;
    headerActions.hidden = !logado;
  }

  supabase.auth.onAuthStateChange(function (_evento, sessao) {
    atualizarUI();
    if (sessao) {
      carregarCategorias().catch(function (err) { toast("Erro ao carregar categorias: " + err.message, true); });
      carregarProdutos().catch(function (err) { toast("Erro ao carregar produtos: " + err.message, true); });
    }
  });

  atualizarUI();
})();
