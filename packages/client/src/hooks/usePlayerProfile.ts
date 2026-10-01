import { useState, useEffect, useCallback } from 'react';

export interface StudentProfile {
  userId: string;
  playerRank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  currentXp: number;
  streakDays: number;
  totalPureRuns: number;
  conqueredModules: string[];
  currentMana: number;
  maxMana: number;
}

export const usePlayerProfile = (userId?: string) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/mana/profile/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    fetchProfile();

    const interval = setInterval(() => {
      fetchProfile();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, fetchProfile]);

  return { profile, isLoading, error, refetch: fetchProfile };
};
