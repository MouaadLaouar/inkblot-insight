-- Add new columns to test_responses table
ALTER TABLE public.test_responses
ADD COLUMN IF NOT EXISTS c_value text,
ADD COLUMN IF NOT EXISTS ban text,
ADD COLUMN IF NOT EXISTS obs text,
ADD COLUMN IF NOT EXISTS intense_time integer;