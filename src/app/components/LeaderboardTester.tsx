'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function LeaderboardTester() {
  const { data: session } = useSession();
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Use refs to avoid stale closures in the keybind handler
  const sessionRef = useRef(session);
  const isLoadingRef = useRef(isLoading);

  // Keep refs updated
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const giveRandomScore = useCallback(async () => {
    if (!sessionRef.current || isLoadingRef.current) return;

    setIsLoading(true);
    setMessage('');

    try {
      // Generate random scores between 0-1000
      const artScore = Math.floor(Math.random() * 1001);
      const pvpScore = Math.floor(Math.random() * 1001);
      const artistScore = Math.floor(Math.random() * 1001);

      const response = await fetch('/api/leaderboard/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artScore, pvpScore, artistScore })
      });

      const result = await response.json();

      if (response.ok) {
        const timestamp = new Date().toLocaleTimeString();
        setLastUpdate(timestamp);
        setMessage(`✅ Scores updated! Art: ${artScore}, 1v1: ${pvpScore}, Artist: ${artistScore}`);
      } else {
        console.error('Leaderboard update failed:', result);
        setMessage(`❌ Error (${response.status}): ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only respond if user is signed in and presses 'G' key
      // Ignore if typing in an input/textarea to prevent conflicts
      if (
        event.key.toLowerCase() === 'g' &&
        sessionRef.current &&
        !(event.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')
      ) {
        event.preventDefault();
        giveRandomScore();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [giveRandomScore]);

  // Don't show if user is not signed in
  if (!session) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">🎮 Leaderboard Tester</h3>
        <span className="text-xs text-gray-400">
          {isLoading ? '⏳ Updating...' : '✅ Ready'}
        </span>
      </div>
      
      <div className="text-xs mb-3">
        <p className="mb-1">Press <kbd className="bg-gray-700 px-2 py-1 rounded font-mono">G</kbd> to give a random score</p>
        {lastUpdate && (
          <p className="text-gray-400">Last update: {lastUpdate}</p>
        )}
      </div>

      {message && (
        <div className="text-xs bg-gray-700 p-2 rounded mb-2">
          {message}
        </div>
      )}

      <button
        onClick={giveRandomScore}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs font-bold py-2 px-4 rounded transition-colors"
      >
        {isLoading ? 'Updating...' : 'Give Random Score'}
      </button>
    </div>
  );
}