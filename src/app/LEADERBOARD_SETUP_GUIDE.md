# Leaderboard Setup and Troubleshooting Guide

## Recent Fixes Applied

### 1. Keybind Functionality (LeaderboardTester.tsx)
**Problem:** The 'G' key keybind wasn't working reliably due to stale closures in React hooks.

**Solution:** 
- Added `useRef` to maintain stable references to `session` and `isLoading` state
- Updated refs whenever state changes using `useEffect`
- Modified `giveRandomScore` and keybind handler to use refs instead of direct state
- Added protection to prevent keybind from triggering when typing in inputs/textareas

### 2. Leaderboard Entry Creation (api/leaderboard/update/route.ts)
**Problem:** The API only performed updates, but if a user didn't have a leaderboard entry yet, the update would fail silently (no rows matched).

**Solution:**
- Added logic to check if a leaderboard entry exists for the user
- If entry exists: perform update (previous behavior)
- If entry doesn't exist: create new entry with `insert()`
- This ensures scores are saved whether or not the user had a previous entry

## How to Test

### Step 1: Verify Database Setup
Make sure you've run `leaderboard-schema.sql` in your Supabase SQL Editor:
1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Copy and paste the contents of `leaderboard-schema.sql`
4. Click 'Run'

### Step 2: Test the Keybind
1. Start your development server: `npm run dev`
2. Log in to the application
3. Navigate to any page
4. Press the 'G' key
5. You should see a floating widget in the bottom-right corner showing:
   - "⏳ Updating..." while processing
   - "✅ Scores updated! Art: [number], 1v1: [number], Artist: [number]" on success
   - Or an error message if something went wrong

### Step 3: Verify Leaderboard
1. Navigate to the `/leaderboard` page
2. You should see your user in the leaderboard with the scores that were just added
3. Switch between the "Art", "1v1", and "Artist" tabs to see different score categories

### Step 4: Alternative Testing Methods
If the keybind doesn't work, you can also:
- Click the "Give Random Score" button in the floating widget
- Run the test script: `node test-leaderboard-update.js`

## Troubleshooting

### Issue: "Supabase not configured" error
**Cause:** Missing environment variables
**Solution:** Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Issue: "Unauthorized" error
**Cause:** User is not logged in or session doesn't have user ID
**Solution:** Make sure you're logged in. Check that NextAuth is properly configured.

### Issue: Scores not appearing on leaderboard
**Possible causes:**
1. **Leaderboard table doesn't exist** - Run `leaderboard-schema.sql` in Supabase
2. **User ID mismatch** - The user ID in the session must match the user ID in the database
3. **Database permissions** - Check that the service role key has proper permissions

### Issue: Keybind not working
**Possible causes:**
1. **Not logged in** - The widget only shows when logged in
2. **Typing in an input** - The keybind is disabled when typing in inputs/textareas
3. **Browser focus** - Make sure the browser window has focus

## How It Works

### Data Flow:
1. User presses 'G' key (or clicks button)
2. `LeaderboardTester` component generates random scores (0-1000)
3. Sends POST request to `/api/leaderboard/update` with scores
4. API endpoint:
   - Verifies user is authenticated
   - Checks if leaderboard entry exists
   - Creates new entry or updates existing one
   - Returns success/error response
5. Component displays result in the floating widget
6. Leaderboard page fetches and displays all entries

### Database Schema:
The `leaderboard` table has:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to users table)
- `art_score` (integer)
- `pvp_score` (integer)
- `artist_score` (integer)
- `created_at` and `updated_at` timestamps

### Key Features:
- **Automatic entry creation:** If user doesn't have a leaderboard entry, one is created
- **Stale closure prevention:** Uses refs to ensure keybind always has current state
- **Input protection:** Keybind won't trigger when typing in text fields
- **Error handling:** Detailed error messages for debugging
- **Visual feedback:** Loading states and success/error messages