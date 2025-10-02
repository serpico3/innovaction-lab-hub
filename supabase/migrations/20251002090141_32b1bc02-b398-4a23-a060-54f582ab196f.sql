-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('amministratore', 'formatore', 'scuola');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cognome TEXT,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create scuola table
CREATE TABLE public.scuola (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  indirizzo TEXT NOT NULL,
  contatto TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scuola ENABLE ROW LEVEL SECURITY;

-- Create formatore table
CREATE TABLE public.formatore (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  disponibilita TEXT,
  ore_totali INTEGER DEFAULT 0,
  lezioni_concluse INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.formatore ENABLE ROW LEVEL SECURITY;

-- Create materiale table
CREATE TABLE public.materiale (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descrizione TEXT,
  quantita_disponibile INTEGER NOT NULL DEFAULT 0,
  soglia_minima INTEGER NOT NULL DEFAULT 5,
  qr_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.materiale ENABLE ROW LEVEL SECURITY;

-- Create attivita table
CREATE TABLE public.attivita (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titolo TEXT NOT NULL,
  descrizione TEXT,
  data DATE NOT NULL,
  orario TIME NOT NULL,
  scuola_id UUID REFERENCES public.scuola(id) ON DELETE SET NULL,
  formatore_id UUID REFERENCES public.formatore(id) ON DELETE SET NULL,
  stato TEXT DEFAULT 'programmata',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.attivita ENABLE ROW LEVEL SECURITY;

-- Create movimento table
CREATE TABLE public.movimento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materiale_id UUID NOT NULL REFERENCES public.materiale(id) ON DELETE CASCADE,
  formatore_id UUID NOT NULL REFERENCES public.formatore(id) ON DELETE CASCADE,
  data_prelievo TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_restituzione TIMESTAMPTZ,
  tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('prelievo', 'restituzione')),
  quantita INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.movimento ENABLE ROW LEVEL SECURITY;

-- Create consumo table
CREATE TABLE public.consumo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attivita_id UUID NOT NULL REFERENCES public.attivita(id) ON DELETE CASCADE,
  materiale_id UUID NOT NULL REFERENCES public.materiale(id) ON DELETE CASCADE,
  quantita_usata INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.consumo ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Anyone can view roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'amministratore'));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'amministratore'));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'amministratore'));

-- RLS Policies for scuola
CREATE POLICY "Everyone can view schools" ON public.scuola FOR SELECT USING (true);
CREATE POLICY "Admins can insert schools" ON public.scuola FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'amministratore'));
CREATE POLICY "Admins can update schools" ON public.scuola FOR UPDATE USING (public.has_role(auth.uid(), 'amministratore'));
CREATE POLICY "Admins can delete schools" ON public.scuola FOR DELETE USING (public.has_role(auth.uid(), 'amministratore'));

-- RLS Policies for formatore
CREATE POLICY "Everyone can view trainers" ON public.formatore FOR SELECT USING (true);
CREATE POLICY "Trainers can update own profile" ON public.formatore FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can insert trainers" ON public.formatore FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'amministratore'));
CREATE POLICY "Admins can update trainers" ON public.formatore FOR UPDATE USING (public.has_role(auth.uid(), 'amministratore'));
CREATE POLICY "Admins can delete trainers" ON public.formatore FOR DELETE USING (public.has_role(auth.uid(), 'amministratore'));

-- RLS Policies for materiale
CREATE POLICY "Everyone can view materials" ON public.materiale FOR SELECT USING (true);
CREATE POLICY "Admins can insert materials" ON public.materiale FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'amministratore'));
CREATE POLICY "Admins can update materials" ON public.materiale FOR UPDATE USING (public.has_role(auth.uid(), 'amministratore'));
CREATE POLICY "Admins can delete materials" ON public.materiale FOR DELETE USING (public.has_role(auth.uid(), 'amministratore'));

-- RLS Policies for attivita
CREATE POLICY "Everyone can view activities" ON public.attivita FOR SELECT USING (true);
CREATE POLICY "Admins and trainers can insert activities" ON public.attivita FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'amministratore') OR public.has_role(auth.uid(), 'formatore')
);
CREATE POLICY "Admins and trainers can update activities" ON public.attivita FOR UPDATE USING (
  public.has_role(auth.uid(), 'amministratore') OR public.has_role(auth.uid(), 'formatore')
);
CREATE POLICY "Admins can delete activities" ON public.attivita FOR DELETE USING (public.has_role(auth.uid(), 'amministratore'));

-- RLS Policies for movimento
CREATE POLICY "Everyone can view movements" ON public.movimento FOR SELECT USING (true);
CREATE POLICY "Trainers can insert movements" ON public.movimento FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'formatore') OR public.has_role(auth.uid(), 'amministratore')
);

-- RLS Policies for consumo
CREATE POLICY "Everyone can view consumption" ON public.consumo FOR SELECT USING (true);
CREATE POLICY "Admins and trainers can insert consumption" ON public.consumo FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'amministratore') OR public.has_role(auth.uid(), 'formatore')
);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materiale_updated_at BEFORE UPDATE ON public.materiale
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, cognome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'User'),
    NEW.raw_user_meta_data->>'cognome',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
-- Sample schools
INSERT INTO public.scuola (nome, indirizzo, contatto, email) VALUES
  ('Istituto Comprensivo Da Vinci', 'Via Roma 123, Milano', '+39 02 1234567', 'davinci@scuola.it'),
  ('Liceo Scientifico Galilei', 'Corso Italia 45, Torino', '+39 011 9876543', 'galilei@liceo.it'),
  ('Scuola Media Manzoni', 'Piazza Duomo 8, Firenze', '+39 055 1122334', 'manzoni@scuola.it'),
  ('Istituto Tecnico Fermi', 'Viale Europa 67, Bologna', '+39 051 5566778', 'fermi@tecnico.it');

-- Note: Sample users, trainers, materials, activities, and movements will be added after authentication is set up