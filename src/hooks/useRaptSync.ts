import { useState, useCallback, useEffect } from 'react';
import { raptApi } from '../utils/raptApi';
import type { Session, RaptSettings } from '../types/brewing';

export const useRaptSync = (
  session: Session | undefined,
  raptSettings: RaptSettings,
  updateSession: (id: string, updates: Partial<Session>) => void,
  updateRaptSettings: (settings: Partial<RaptSettings>) => void
) => {
  const [syncing, setSyncing] = useState(false);

  const syncHistory = useCallback(async () => {
    if (!session?.raptPillId || !session?.raptLogStart || syncing) return;
    
    setSyncing(true);
    try {
      const { token, expiry } = await raptApi.fetchToken(raptSettings);
      updateRaptSettings({ token, tokenExpiry: expiry });
      
      const endDate = session.raptLogEnd || new Date().toISOString();
      const history = await raptApi.getHistoricalTelemetry(
        token, 
        session.raptPillId, 
        'RAPTPill', 
        session.raptLogStart, 
        endDate
      );

      const formattedHistory = history
        .map(h => ({ 
          gravity: h.gravity || 0, 
          temperature: h.temperature || 0, 
          timestamp: h.lastSeen || new Date().toISOString(),
          gravityVelocity: h.gravityVelocity
        }))
        .filter(h => h.gravity > 0)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      updateSession(session.id, { raptPillData: formattedHistory });
    } catch (err) {
      console.error('Failed to sync history:', err);
    } finally {
      setSyncing(false);
    }
  }, [session, raptSettings, updateSession, updateRaptSettings, syncing]);

  // Auto-sync on mount if logging is active
  useEffect(() => {
    if (session?.raptLogStart && !session.raptLogEnd && session.raptPillId) {
      syncHistory();
    }
  }, [session?.id, session?.raptLogStart, session?.raptLogEnd, session?.raptPillId, syncHistory]);

  return {
    syncing,
    syncHistory
  };
};
