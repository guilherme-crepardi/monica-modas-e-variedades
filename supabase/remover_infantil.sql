-- ============================================================
-- Monica Modas - REMOVER CATEGORIA INFANTIL
-- Rode este script no: Supabase > SQL Editor > New query > Run
-- Remove a categoria Infantil e os produtos dela (cascade),
-- e reordena as categorias restantes.
-- ============================================================

delete from public.categorias where slug = 'infantil';

update public.categorias set ordem = 1 where slug = 'feminino';
update public.categorias set ordem = 2 where slug = 'masculino';
update public.categorias set ordem = 3 where slug = 'calcados';
update public.categorias set ordem = 4 where slug = 'bolsas';
update public.categorias set ordem = 5 where slug = 'variedades';
