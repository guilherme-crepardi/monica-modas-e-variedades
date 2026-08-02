-- ============================================================
-- Monica Modas e Variedades - Setup do Supabase
-- Execute este script no: SQL Editor > New query > Run
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- TABELAS ----------

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ordem int default 0,
  criado_em timestamptz default now()
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria_id uuid references public.categorias(id) on delete cascade,
  preco numeric not null,
  preco_antigo numeric,
  cor text default '#e75480',
  descricao text,
  em_oferta boolean default false,
  imagem_url text,
  criado_em timestamptz default now()
);

-- ---------- SEGURANCA (RLS) ----------

alter table public.categorias enable row level security;
alter table public.produtos enable row level security;

drop policy if exists "categorias select publico" on public.categorias;
drop policy if exists "produtos select publico" on public.produtos;
drop policy if exists "categorias admin" on public.categorias;
drop policy if exists "produtos admin" on public.produtos;

create policy "categorias select publico" on public.categorias
  for select to anon, authenticated using (true);

create policy "produtos select publico" on public.produtos
  for select to anon, authenticated using (true);

-- So o e-mail abaixo pode escrever/alterar/excluir.
-- Para dar acesso a outra pessoa, troque o e-mail nesta policy.
create policy "categorias admin" on public.categorias
  for all to authenticated
  using (auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com')
  with check (auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com');

create policy "produtos admin" on public.produtos
  for all to authenticated
  using (auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com')
  with check (auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com');

-- ---------- STORAGE (fotos) ----------

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

drop policy if exists "fotos leitura publica" on storage.objects;
drop policy if exists "fotos escrita admin" on storage.objects;
drop policy if exists "fotos atualizar admin" on storage.objects;
drop policy if exists "fotos deletar admin" on storage.objects;

create policy "fotos leitura publica" on storage.objects
  for select to anon, authenticated using (bucket_id = 'fotos');

create policy "fotos escrita admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com');

create policy "fotos atualizar admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos' and auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com');

create policy "fotos deletar admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com');

-- ---------- CATEGORIAS INICIAIS ----------

insert into public.categorias (nome, slug, ordem) values
  ('Feminino', 'feminino', 1),
  ('Masculino', 'masculino', 2),
  ('Infantil', 'infantil', 3),
  ('Calçados', 'calcados', 4),
  ('Bolsas & Acessórios', 'bolsas', 5),
  ('Casa & Variedades', 'variedades', 6)
on conflict (slug) do nothing;

-- ---------- PRODUTOS INICIAIS ----------

insert into public.produtos (nome, categoria_id, preco, preco_antigo, cor, descricao, em_oferta, imagem_url) values
  ('Vestido Midi Floral', (select id from categorias where slug='feminino'), 129.9, 169.9, '#e75480', 'Vestido midi com estampa floral, tecido leve e fluido, perfeito para o dia a dia e ocasiões especiais. Disponível nos tamanhos P ao GG.', true, null),
  ('Blusa Cropped Canelada', (select id from categorias where slug='feminino'), 49.9, 69.9, '#9b6b8e', 'Cropped de malha canelada com excelente elasticidade e caimento. Combina com saias, calças e shorts.', false, null),
  ('Calça Jeans Skinny', (select id from categorias where slug='feminino'), 99.9, 139.9, '#4a6fa5', 'Calça jeans skinny com elastano, conforto e modelagem que valoriza o corpo. Lavagem média.', true, null),
  ('Saia Plissada', (select id from categorias where slug='feminino'), 79.9, 99.9, '#d96c75', 'Saia plissada moderna, com cintura alta e movimento lindo. Ideal para looks casuais e sociais.', false, null),
  ('Camisa Social Feminina', (select id from categorias where slug='feminino'), 199.9, 259.9, '#8e3b6f', 'Camisa feminina social de manga longa em linho, elegante e confortável para o trabalho e eventos.', false, 'fotos/feminino-camisa-feminina-social-manga-longa-linho.jpg'),
  ('Camisa Social Masculina', (select id from categorias where slug='masculino'), 89.9, 119.9, '#5b7a9d', 'Camisa social de algodão, com caimento perfeito e toque macio. Disponível do M ao GG.', false, 'fotos/camisa_social_marinho_masculina_slim_manga_longa_anticorpus_.webp'),
  ('Camiseta Básica Premium', (select id from categorias where slug='masculino'), 39.9, 54.9, '#3d5a6c', 'Camiseta básica premium em algodão penteado, com gola reforçada. A peça coringa do guarda-roupa.', true, null),
  ('Calça Jeans Masculina', (select id from categorias where slug='masculino'), 109.9, 149.9, '#47698a', 'Calça jeans masculina reta, lavagem azul escura. Durável e confortável para todas as ocasiões.', false, null),
  ('Bermuda Masculina', (select id from categorias where slug='masculino'), 69.9, 89.9, '#6b7d52', 'Bermuda masculina com tecido de secagem rápida, ideal para o verão e atividades ao ar livre.', false, null),
  ('Vestido Infantil Floral', (select id from categorias where slug='infantil'), 59.9, 79.9, '#f2a0b5', 'Vestido infantil com estampa floral, tecido confortável e sem etiqueta. Tamanhos 2 ao 12.', false, null),
  ('Camiseta Infantil Colorida', (select id from categorias where slug='infantil'), 34.9, 44.9, '#f29a4a', 'Camiseta infantil de algodão, leve e fresquinha. Cores vibrantes que as crianças adoram.', true, null),
  ('Tênis Infantil', (select id from categorias where slug='infantil'), 79.9, 109.9, '#58a6a0', 'Tênis infantil com velcro, leve e flexível, ideal para brincar com segurança e conforto.', false, null),
  ('Tênis Feminino Casual', (select id from categorias where slug='calcados'), 149.9, 199.9, '#e7a6b8', 'Tênis feminino casual em couro sintético, com solado confortável. Combina com tudo.', true, null),
  ('Sandália Salto Grosso', (select id from categorias where slug='calcados'), 119.9, 159.9, '#b05c7a', 'Sandália de salto grosso com tira ajustável, firme e elegante. Perfeita para o dia e a noite.', false, null),
  ('Sapatilha Feminina', (select id from categorias where slug='calcados'), 89.9, 119.9, '#7d5a8c', 'Sapatilha feminina com palmilha de gel, super macia para o dia inteiro de conforto.', false, null),
  ('Rasteirinha com Tira', (select id from categorias where slug='calcados'), 49.9, 69.9, '#c9873d', 'Rasteirinha com tira em V, leve e confortável. A queridinha do verão.', true, null),
  ('Bota Cano Curto', (select id from categorias where slug='calcados'), 179.9, 239.9, '#5c4033', 'Bota de cano curto com zíper lateral, versátil para o inverno. Estilo e proteção.', false, null),
  ('Bolsa Transversal', (select id from categorias where slug='bolsas'), 129.9, 169.9, '#a0507a', 'Bolsa transversal com compartimento para celular e carteira. Prática e cheia de estilo.', true, null),
  ('Carteira Feminina', (select id from categorias where slug='bolsas'), 49.9, 69.9, '#8a6fb0', 'Carteira feminina com muitos porta-cartões e moedeiro. Compacta e organizada.', false, null),
  ('Cinto de Couro', (select id from categorias where slug='bolsas'), 39.9, 54.9, '#6b4a3a', 'Cinto de couro com fivela clássica. Dá acabamento perfeito a qualquer look.', false, null),
  ('Óculos de Sol', (select id from categorias where slug='bolsas'), 59.9, 89.9, '#3b3b4a', 'Óculos de sol com proteção UV400 e armação leve. Estilo para todos os dias.', true, null),
  ('Necessaire Organizadora', (select id from categorias where slug='variedades'), 29.9, 39.9, '#4f9d8f', 'Necessaire com zíper e forro resistente. Ideal para viagens e organização do dia a dia.', false, null),
  ('Kit Toalhas de Banho', (select id from categorias where slug='variedades'), 89.9, 129.9, '#7f9cba', 'Kit com 2 toalhas de banho e 1 rosto em algodão, macias e absorventes.', true, null),
  ('Vela Aromática', (select id from categorias where slug='variedades'), 24.9, 34.9, '#d9a25a', 'Vela aromática de cera vegetal com aroma suave, para deixar sua casa mais aconchegante.', false, null);
