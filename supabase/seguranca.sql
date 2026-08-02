-- ============================================================
-- Monica Modas - BLOQUEIO DE SEGURANCA
-- Rode este script no: Supabase > SQL Editor > New query > Run
-- Depois de rodar, NENHUM outro e-mail podera alterar produtos,
-- categorias ou fotos. Somente mastertecheletronica15@gmail.com.
-- ============================================================

drop policy if exists "categorias admin" on public.categorias;
drop policy if exists "produtos admin" on public.produtos;
drop policy if exists "fotos escrita admin" on storage.objects;
drop policy if exists "fotos atualizar admin" on storage.objects;
drop policy if exists "fotos deletar admin" on storage.objects;

create policy "categorias admin" on public.categorias
  for all to authenticated
  using (auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com')
  with check (auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com');

create policy "produtos admin" on public.produtos
  for all to authenticated
  using (auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com')
  with check (auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com');

create policy "fotos escrita admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com');

create policy "fotos atualizar admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos' and auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com');

create policy "fotos deletar admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and auth.jwt() ->> 'email' = 'mastertecheletronica15@gmail.com');
