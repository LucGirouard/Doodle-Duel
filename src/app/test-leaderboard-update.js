// Test script to simulate updating a user's leaderboard score
// This script directly updates the Supabase database using the service role key

require('dotenv').config({ path: '../../.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: Supabase credentials not found in .env.local");
  process.exit(1);
}

async function updateLeaderboard() {
  try {
    // First, get all users from the users table
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    const users = await usersResponse.json();
    
    if (!users || users.length === 0) {
      console.log("No users found in the database. Please create a user first.");
      return;
    }

    // Pick the first user to update
    const user = users[0];
    console.log(`Updating scores for user: ${user.email} (ID: ${user.id})`);

    // Simulate some scores
    const scores = {
      art_score: Math.floor(Math.random() * 1000) + 500,
      pvp_score: Math.floor(Math.random() * 1000) + 500,
      artist_score: Math.floor(Math.random() * 1000) + 500
    };

    console.log(`New scores: Art=${scores.art_score}, 1v1=${scores.pvp_score}, Artist=${scores.artist_score}`);

    // First, check if the leaderboard table exists by trying to get its schema
    console.log("Checking if leaderboard table exists...");
    const schemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!schemaResponse.ok) {
      const errorText = await schemaResponse.text();
      console.log("\n⚠️  Leaderboard table does not exist or is not accessible.");
      console.log("Error:", errorText);
      console.log("\n📋 To set up the leaderboard, run the 'leaderboard-schema.sql' script in your Supabase SQL Editor:");
      console.log("   1. Go to your Supabase project dashboard");
      console.log("   2. Open SQL Editor");
      console.log("   3. Copy and paste the contents of 'leaderboard-schema.sql'");
      console.log("   4. Click 'Run'");
      return;
    }

    // Update the leaderboard for this user
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?user_id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(scores)
    });

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      if (result && result.length === 0) {
        console.log("\n⚠️  Update returned no records. This likely means no leaderboard entry exists for this user.");
        console.log("The leaderboard table may need to be created, or the user needs to re-register to trigger the auto-create.");
        console.log("\n📋 To set up the leaderboard, run the 'leaderboard-schema.sql' script in your Supabase SQL Editor.");
      } else {
        console.log("Leaderboard updated successfully!");
        console.log("Updated record:", result);
      }
    } else {
      const error = await updateResponse.text();
      console.error("Failed to update leaderboard:", error);
    }

    // Now fetch and display the leaderboard
    console.log("\n--- Current Leaderboard ---");
    const leaderboardResponse = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    const leaderboard = await leaderboardResponse.json();
    console.log("Leaderboard entries:");
    if (Array.isArray(leaderboard)) {
      if (leaderboard.length === 0) {
        console.log("No entries found. The leaderboard table might be empty or not created yet.");
      } else {
        leaderboard.forEach((entry, index) => {
          console.log(`${index + 1}. User ID: ${entry.user_id}`);
          console.log(`   Art Score: ${entry.art_score}, 1v1 Score: ${entry.pvp_score}, Artist Score: ${entry.artist_score}`);
        });
      }
    } else {
      console.log("Leaderboard response:", JSON.stringify(leaderboard, null, 2));
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

updateLeaderboard();