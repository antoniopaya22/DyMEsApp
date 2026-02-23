-- Allow authenticated users to insert their own profile row.
-- Needed when the handle_new_user() trigger didn't fire
-- (e.g. user created before trigger existed, or trigger errored).
-- The app's fetchProfile will auto-create the row via upsert.
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
