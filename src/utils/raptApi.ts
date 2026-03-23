import type { RaptSettings, RaptDevice, RaptTelemetry } from '../types/brewing';

// For local dev via Vite Proxy. 
// When deploying, these should be replaced by your Supabase Edge Function URLs.
const AUTH_URL = '/rapt-auth';
const API_BASE_URL = '/rapt-api';

export const raptApi = {
  /**
   * Exchanges username and API secret for a JWT token.
   */
  async fetchToken(settings: RaptSettings): Promise<{ token: string; expiry: string }> {
    if (!settings.username || !settings.password) {
      throw new Error('RAPT credentials missing.');
    }

    const details: Record<string, string> = {
      'client_id': 'rapt-user',
      'grant_type': 'password',
      'username': settings.username,
      'password': settings.password,
    };

    const formBody = Object.keys(details)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key]))
      .join('&');

    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to authenticate with RAPT: ${error}`);
    }

    const data = await response.json();
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + data.expires_in);

    return {
      token: data.access_token,
      expiry: expiryDate.toISOString(),
    };
  },

  /**
   * Fetches all registered devices (BrewZillas and Hydrometers).
   */
  async getDevices(token: string): Promise<RaptDevice[]> {
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      // Fetch from both endpoints in parallel
      const [bzRes, hydroRes] = await Promise.all([
        fetch(`${API_BASE_URL}/BrewZillas/GetBrewZillas`, { headers }),
        fetch(`${API_BASE_URL}/Hydrometers/GetHydrometers`, { headers })
      ]);

      if (!bzRes.ok || !hydroRes.ok) {
        throw new Error('Failed to fetch some RAPT devices.');
      }

      const [bzData, hydroData] = await Promise.all([
        bzRes.json(),
        hydroRes.json()
      ]);

      const devices: RaptDevice[] = [];

      // Map BrewZillas
      bzData.forEach((d: any) => {
        devices.push({ id: d.id, name: d.name, type: 'BrewZilla', macAddress: d.macAddress });
      });

      // Map Hydrometers (Pills)
      hydroData.forEach((d: any) => {
        devices.push({ id: d.id, name: d.name, type: 'RAPTPill', macAddress: d.macAddress });
      });

      return devices;
    } catch (error) {
      console.error('Error fetching RAPT devices:', error);
      throw error;
    }
  },

  /**
   * Fetches latest telemetry by retrieving all devices of that type and filtering.
   * This is more robust than the singular endpoints which are prone to parameter name issues.
   */
  async getDeviceTelemetry(token: string, deviceId: string, deviceType: 'BrewZilla' | 'RAPTPill'): Promise<RaptTelemetry> {
    const headers = { 'Authorization': `Bearer ${token}` };
    const endpoint = deviceType === 'BrewZilla' ? 'BrewZillas/GetBrewZillas' : 'Hydrometers/GetHydrometers';
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch device data for ${deviceId}`);
    }

    const data = await response.json();
    const device = data.find((d: any) => d.id === deviceId);

    if (!device) {
      throw new Error(`Device ${deviceId} not found in RAPT Cloud.`);
    }
    
    // Normalize gravity (handle 1042 vs 1.042)
    const normalizedGravity = device.gravity > 10 ? device.gravity / 1000 : device.gravity;

    return {
      temperature: device.temperature,
      targetTemperature: device.targetTemperature,
      gravity: normalizedGravity,
      gravityVelocity: device.gravityVelocity,
      battery: device.battery,
      rssi: device.rssi,
      lastSeen: device.createdOn || device.dateTime || device.createdDate || device.timestamp || device.lastSeen,
    };
  },

  /**
   * Fetches historical telemetry for a specific time range.
   */
  async getHistoricalTelemetry(token: string, deviceId: string, deviceType: 'BrewZilla' | 'RAPTPill', startDate: string, endDate: string): Promise<RaptTelemetry[]> {
    const typePath = deviceType === 'BrewZilla' ? 'BrewZillas' : 'Hydrometers';
    const idParam = deviceType === 'BrewZilla' ? 'DeviceId' : 'hydrometerId';
    
    // Strip milliseconds from ISO strings
    const formattedStart = startDate.split('.')[0] + 'Z';
    const formattedEnd = endDate.split('.')[0] + 'Z';

    const url = `${API_BASE_URL}/${typePath}/GetTelemetry?${idParam}=${deviceId}&StartDate=${encodeURIComponent(formattedStart)}&EndDate=${encodeURIComponent(formattedEnd)}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RAPT API Error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch historical telemetry (${response.status}).`);
    }

    const data = await response.json();
    
    // RAPT returns an array of HydrometerTelemetryModel or BrewZillaTelemetryModel
    return data.map((d: any) => ({
      temperature: d.temperature,
      targetTemperature: d.targetTemperature,
      gravity: d.gravity > 10 ? d.gravity / 1000 : d.gravity,
      gravityVelocity: d.gravityVelocity,
      battery: d.battery,
      rssi: d.rssi,
      // For HydrometerTelemetryModel, createdOn is the standard timestamp
      lastSeen: d.createdOn || d.dateTime || d.createdDate || d.timestamp,
    }));
  }
};
