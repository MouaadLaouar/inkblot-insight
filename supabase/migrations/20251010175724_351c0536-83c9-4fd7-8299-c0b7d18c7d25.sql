-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'clinician',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rorschach_tests table
CREATE TABLE public.rorschach_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  total_responses INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_responses table for individual card responses
CREATE TABLE public.test_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.rorschach_tests(id) ON DELETE CASCADE,
  card_number INTEGER NOT NULL CHECK (card_number >= 1 AND card_number <= 10),
  response_number INTEGER NOT NULL,
  response_text TEXT NOT NULL,
  location TEXT,
  determinants TEXT[] DEFAULT '{}',
  content_categories TEXT[] DEFAULT '{}',
  popular_response BOOLEAN DEFAULT FALSE,
  form_quality TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, card_number, response_number)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rorschach_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_responses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Patients policies
CREATE POLICY "Users can view their own patients"
  ON public.patients FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create patients"
  ON public.patients FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own patients"
  ON public.patients FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own patients"
  ON public.patients FOR DELETE
  USING (auth.uid() = created_by);

-- Rorschach tests policies
CREATE POLICY "Users can view tests for their patients"
  ON public.rorschach_tests FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create tests"
  ON public.rorschach_tests FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tests"
  ON public.rorschach_tests FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tests"
  ON public.rorschach_tests FOR DELETE
  USING (auth.uid() = created_by);

-- Test responses policies
CREATE POLICY "Users can view responses for their tests"
  ON public.test_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rorschach_tests
      WHERE rorschach_tests.id = test_responses.test_id
      AND rorschach_tests.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create responses for their tests"
  ON public.test_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rorschach_tests
      WHERE rorschach_tests.id = test_responses.test_id
      AND rorschach_tests.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update responses for their tests"
  ON public.test_responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.rorschach_tests
      WHERE rorschach_tests.id = test_responses.test_id
      AND rorschach_tests.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete responses for their tests"
  ON public.test_responses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.rorschach_tests
      WHERE rorschach_tests.id = test_responses.test_id
      AND rorschach_tests.created_by = auth.uid()
    )
  );

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.rorschach_tests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.test_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();