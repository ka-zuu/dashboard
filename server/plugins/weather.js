const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const cache = new Map(); // Key: "lat,lon", Value: { data, timestamp }

const defaultSettings = {
    latitude: 35.6895, // Tokyo
    longitude: 139.6917
};

export const meta = {
    id: 'weather',
    name: 'Weather',
    description: 'Displays weather forecast',
    defaultW: 4,
    defaultH: 4
};

export const init = async (io) => {
    console.log('Weather plugin initialized');
};

export const getData = async (settings = {}) => {
    const latitude = settings.latitude || defaultSettings.latitude;
    const longitude = settings.longitude || defaultSettings.longitude;
    const cacheKey = `${latitude},${longitude}`;
    const now = Date.now();

    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_DURATION_MS)) {
        return cached.data;
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
        }

        const data = await response.json();

        const result = {
            type: 'weather',
            data: {
                ...data.current_weather,
                location: `Lat: ${latitude}, Lon: ${longitude}` // Simple location display
            }
        };

        cache.set(cacheKey, {
            data: result,
            timestamp: now
        });

        return result;
    } catch (error) {
        console.error('Error fetching weather:', error);
        // Return cached data if available even if expired, or error
        return cached?.data || { type: 'weather', error: 'Failed to fetch weather' };
    }
};
