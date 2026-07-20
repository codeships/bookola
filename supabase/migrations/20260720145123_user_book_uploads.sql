-- User-submitted books and their cover/file storage.
-- Uploads are public catalog entries, while writes stay scoped to the owner's folder.

alter table public.books drop constraint if exists books_source_check;
alter table public.books
  add column if not exists uploaded_by uuid references auth.users (id) on delete set null,
  add constraint books_source_check
    check (source in ('local', 'gutendex', 'openlibrary', 'upload'));

create index if not exists books_uploaded_by_idx on public.books (uploaded_by)
  where uploaded_by is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'book-uploads',
  'book-uploads',
  true,
  6291456,
  array[
    'application/pdf',
    'application/epub+zip',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users upload book files to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'book-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users remove their own uploaded book files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'book-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

comment on column public.books.uploaded_by is 'Owner of a user-uploaded catalog entry; null for external catalog books.';

grant insert, update, delete on public.books to authenticated;

create policy "Users can remove their own uploaded books"
  on public.books for delete
  to authenticated
  using (source = 'upload' and uploaded_by = (select auth.uid()));
