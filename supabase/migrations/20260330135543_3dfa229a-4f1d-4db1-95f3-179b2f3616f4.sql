
ALTER TABLE public.candidates
  ADD COLUMN is_favorite boolean NOT NULL DEFAULT false,
  ADD COLUMN status text NOT NULL DEFAULT 'disponivel',
  ADD COLUMN tags text[] DEFAULT '{}';
