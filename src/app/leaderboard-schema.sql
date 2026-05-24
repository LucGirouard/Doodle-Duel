-- Leaderboard Database Schema for Art Battle HTM
-- Run this SQL in your Supabase SQL Editor to set up the leaderboard tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  art_score INTEGER DEFAULT 0 NOT NULL,
  pvp_score INTEGER DEFAULT 0 NOT NULL,
  artist_score INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_art_score ON public.leaderboard(art_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_pvp_score ON public.leaderboard(pvp_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_artist_score ON public.leaderboard(artist_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leaderboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_leaderboard_updated_at
BEFORE UPDATE ON public.leaderboard
FOR EACH ROW
EXECUTE FUNCTION update_leaderboard_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read leaderboard data
CREATE POLICY "Anyone can read leaderboard" ON public.leaderboard
FOR SELECT
USING (true);

-- Policy: Users can update their own leaderboard entry
CREATE POLICY "Users can update own leaderboard" ON public.leaderboard
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can insert their own leaderboard entry
CREATE POLICY "Users can insert own leaderboard" ON public.leaderboard
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to create leaderboard entry when user registers
CREATE OR REPLACE FUNCTION create_leaderboard_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leaderboard (user_id, email, art_score, pvp_score, artist_score)
  VALUES (NEW.id, NEW.email, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create leaderboard entry when user registers
CREATE TRIGGER create_leaderboard_on_user_signup
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION create_leaderboard_entry();

-- Helper function to update user scores (call this from your game logic)
CREATE OR REPLACE FUNCTION update_user_score(
  p_user_id UUID,
  p_art_score INTEGER DEFAULT NULL,
  p_pvp_score INTEGER DEFAULT NULL,
  p_artist_score INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.leaderboard
  SET 
    art_score = COALESCE(p_art_score, art_score),
    pvp_score = COALESCE(p_pvp_score, pvp_score),
    artist_score = COALESCE(p_artist_score, artist_score),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the helper function to authenticated users
GRANT EXECUTE ON FUNCTION update_user_score TO authenticated;

-- View to get leaderboard with user emails (for backward compatibility)
CREATE OR REPLACE VIEW leaderboard_with_emails AS
SELECT 
  l.id,
  l.user_id,
  l.email,
  l.art_score,
  l.pvp_score,
  l.artist_score,
  l.created_at,
  l.updated_at
FROM public.leaderboard l
ORDER BY l.art_score DESC;

-- Note: The service_role key bypasses RLS, which is needed for the backend
-- to update scores programmatically