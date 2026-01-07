-- 1. Profile-Tabelle (Nutzer & Kuratoren)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  username text,
  is_curator boolean DEFAULT false,
  subscription_status text DEFAULT 'none',
  trial_end_date timestamp with time zone DEFAULT (now() + interval '14 days'),
  total_lumis integer DEFAULT 0,
  -- Die Gem-Zähler für die Kinder
  lumis_astro integer DEFAULT 0,
  lumis_word integer DEFAULT 0,
  lumis_math integer DEFAULT 0,
  lumis_wild integer DEFAULT 0,
  lumis_body integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Video-Tabelle (Die Lerninhalte)
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curator_id uuid REFERENCES public.profiles(id),
  video_url text NOT NULL,
  title text,
  question text,
  options text[], -- Array für die Quiz-Antworten
  correct_index integer,
  category text, -- Astro, Word, Math, Wild, Body
  approved boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. RLS (Row Level Security) - Ganz wichtig für Expo!
-- Erlaubt jedem Nutzer, Videos zu lesen, aber nur Admins/Kuratoren sie zu erstellen.
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos sind für alle sichtbar" ON public.videos FOR SELECT USING (true);