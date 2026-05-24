"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
const supabaseAnonKey = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

interface LeaderboardRawEntry {
  id: string;
  user_id: string;
  email: string;
  art_score?: number;
  pvp_score?: number;
  artist_score?: number;
}

type LeaderboardCategory = "art" | "1v1" | "artist";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  email: string;
  score: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>("art");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      try {
        if (!supabase) {
          setError("Supabase not configured");
          setLeaderboardData([]);
          setLoading(false);
          return;
        }

        const scoreColumn = activeCategory === "1v1" ? "pvp_score" : `${activeCategory}_score`;
        
        // Fetch leaderboard data directly (email is stored in the leaderboard table)
        const { data, error: fetchError } = await supabase
          .from("leaderboard")
          .select(`
            id,
            user_id,
            email,
            ${scoreColumn}
          `)
          .order(scoreColumn, { ascending: false })
          .limit(20);

        if (fetchError) {
          console.error("Leaderboard fetch error:", fetchError.message);
          setError("Failed to load leaderboard");
          setLeaderboardData([]);
        } else if (data && data.length > 0) {
          // Map the data to our interface
          const formatted = (data as unknown as LeaderboardRawEntry[]).map((entry, index: number) => ({
            id: entry.id,
            user_id: entry.user_id,
            email: entry.email || "Unknown User",
            score: Number(entry[scoreColumn as keyof LeaderboardRawEntry] as number) || 0,
            rank: index + 1,
          }));
          setLeaderboardData(formatted);
        } else {
          setLeaderboardData([]);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("An error occurred while loading the leaderboard");
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [activeCategory]);

  const categories = [
    { key: "art" as LeaderboardCategory, label: "Art", icon: "🎨" },
    { key: "1v1" as LeaderboardCategory, label: "1v1", icon: "⚔️" },
    { key: "artist" as LeaderboardCategory, label: "Artist", icon: "👤" },
  ];

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <main className="min-h-screen bg-[#f4ede3] px-6 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/" className="inline-block mb-6">
          <h1 className="text-4xl font-black text-stone-900 hover:opacity-80 transition-opacity">
            Art Battle
          </h1>
        </Link>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Leaderboard</h2>
        <p className="text-stone-600">
          Track the top performers across all categories
        </p>
      </div>

      {/* Category Tabs */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex gap-4 flex-wrap">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                activeCategory === category.key
                  ? "bg-black text-[#fffaf1] shadow-lg"
                  : "bg-white text-stone-900 border border-stone-300 hover:bg-stone-100"
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl font-semibold text-stone-600">Loading...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-xl font-semibold text-red-600 mb-2">Error</div>
            <p className="text-stone-600">{error}</p>
            <p className="text-stone-500 mt-4 text-sm">
              Make sure you&apos;ve run the leaderboard-schema.sql in Supabase
            </p>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl font-semibold text-stone-600 mb-2">No Entries Yet</div>
            <p className="text-stone-600">
              Be the first to compete and set some scores!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Artist</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-stone-900">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-stone-200 ${
                      index < 3 ? "bg-yellow-50" : ""
                    } hover:bg-stone-50 transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-xl">{getRankEmoji(entry.rank)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-stone-900">{entry.email.split('@')[0]}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-lg text-stone-900">
                        {entry.score.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}