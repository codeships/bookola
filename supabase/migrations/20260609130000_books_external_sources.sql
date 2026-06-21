-- Books now come from external catalogs (Project Gutenberg via Gutendex, and
-- Open Library). The public.books table becomes a cache of books a user has
-- interacted with, so library_items / highlights foreign keys still hold.

alter table public.books
  add column if not exists source text not null default 'local'
    check (source in ('local', 'gutendex', 'openlibrary')),
  add column if not exists read_url text,
  add column if not exists download_url text;

comment on column public.books.source is 'Origin catalog: local seed, gutendex, or openlibrary.';
comment on column public.books.read_url is 'URL of the full text/HTML used by the in-app reader.';
comment on column public.books.download_url is 'URL of the downloadable file (e.g. EPUB).';

-- Authenticated users may cache catalog books they interact with (favorite,
-- read, highlight). Reads are already public via the existing select policy.
create policy "Authenticated users can cache catalog books"
  on public.books for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update cached catalog books"
  on public.books for update
  to authenticated
  using (true)
  with check (true);
