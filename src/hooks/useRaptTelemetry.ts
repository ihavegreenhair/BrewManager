import { useState, useEffect, useRef, useCallback } from 'react';
import { useBrewStore } from '../store/useBrewStore';
import { raptApi } from '../utils/raptApi';
import type { RaptTelemetry } from '../types/brewing';

/**
 * Hook for polling RAPT device telemetry.
 */
export const useRaptTelemetry = (deviceId?: string, intervalSeconds = 300, onData?: (data: RaptTelemetry) => void) => {
  const { raptSettings, updateRaptSettings, raptDevices } = useBrewStore();
  const [telemetry, setTelemetry] = useState<RaptTelemetry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<any>(null);
  const onDataRef = useRef(onData);

  const getValidToken = useCallback(async () => {
    // Check if current token is valid (with 5-min buffer)
    const now = new Date();
    const expiry = raptSettings.tokenExpiry ? new Date(raptSettings.tokenExpiry) : null;
    const isTokenValid = raptSettings.token && expiry && (expiry.getTime() - now.getTime() > 300000);

    if (isTokenValid) {
      return raptSettings.token!;
    }

    // Refresh token
    if (!raptSettings.username || !raptSettings.password) {
      throw new Error('RAPT credentials not configured.');
    }

    const { token, expiry: newExpiry } = await raptApi.fetchToken(raptSettings);
    updateRaptSettings({ token, tokenExpiry: newExpiry });
    return token;
  }, [raptSettings, updateRaptSettings]);

  // Keep the ref in sync with the latest callback without triggering re-renders
  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  const fetchTelemetry = useCallback(async () => {
    if (!deviceId) return;
    
    const device = raptDevices.find(d => d.id === deviceId);
    if (!device) return;

    setLoading(true);
    try {
      const token = await getValidToken();
      const data = await raptApi.getDeviceTelemetry(token, deviceId, device.type as any);
      setTelemetry(data);
      if (onDataRef.current) onDataRef.current(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch RAPT telemetry:', err);
      setError(err.message || 'Error fetching telemetry.');
    } finally {
      setLoading(false);
    }
  }, [deviceId, getValidToken, raptDevices]);

  useEffect(() => {
    if (!deviceId || !raptSettings.username || !raptSettings.password) {
      setTelemetry(null);
      return;
    }

    // Initial fetch
    fetchTelemetry();

    // Start polling
    pollTimer.current = setInterval(fetchTelemetry, intervalSeconds * 1000);

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [deviceId, raptSettings.username, raptSettings.password, intervalSeconds, fetchTelemetry]);

  return { telemetry, loading, error, refresh: fetchTelemetry };
};
