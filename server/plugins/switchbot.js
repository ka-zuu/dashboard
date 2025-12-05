import crypto from 'crypto';

const CACHE_DURATION_MS = 60 * 1000; // 60 seconds
let cache = null;
let lastFetchTime = 0;

export const meta = {
    id: 'switchbot',
    name: 'SwitchBot',
    description: 'Displays SwitchBot Meter status',
    defaultW: 2,
    defaultH: 2
};

export const init = async (io) => {
    console.log('SwitchBot plugin initialized');
};

const generateSign = (token, secret) => {
    const t = Date.now();
    const nonce = crypto.randomUUID();
    const data = token + t + nonce;
    const sign = crypto.createHmac('sha256', secret)
        .update(Buffer.from(data, 'utf-8'))
        .digest('base64');
    return { t, nonce, sign };
};

export const getData = async () => {
    const token = process.env.SWITCHBOT_TOKEN;
    const secret = process.env.SWITCHBOT_SECRET;

    if (!token || !secret) {
        return {
            type: 'switchbot',
            data: {
                error: 'Missing SWITCHBOT_TOKEN or SWITCHBOT_SECRET'
            }
        };
    }

    const now = Date.now();
    if (cache && (now - lastFetchTime < CACHE_DURATION_MS)) {
        return cache;
    }

    try {
        const { t, nonce, sign } = generateSign(token, secret);
        const headers = {
            "Authorization": token,
            "sign": sign,
            "nonce": nonce,
            "t": t,
            "Content-Type": "application/json; charset=utf8",
        };

        const response = await fetch("https://api.switch-bot.com/v1.1/devices", { headers });
        if (!response.ok) {
            throw new Error(`SwitchBot API error: ${response.statusText}`);
        }

        const json = await response.json();
        const devices = json.body.deviceList;
        const meters = devices.filter(d => d.deviceType === 'Meter' || d.deviceType === 'MeterPlus' || d.deviceType === 'Hub Mini');

        // For meters, we might need to get status individually if not included in deviceList (v1.1 returns status in deviceList for some, but let's check)
        // Actually v1.1 deviceList returns basic info. We might need /devices/{id}/status for real-time data if not provided.
        // However, for MVP let's try to see if deviceList has what we need or if we need to fetch status.
        // According to docs, deviceList gives basic info. Status is separate.
        // But to avoid N+1 requests every time, let's just return the list first.
        // Wait, the user wants "status (temperature, humidity)".
        // We should fetch status for the first meter found or all meters.
        // To be safe and simple: fetch status for all meters.

        const statusPromises = meters.map(async (meter) => {
            const { t, nonce, sign } = generateSign(token, secret);
            const statusHeaders = {
                "Authorization": token,
                "sign": sign,
                "nonce": nonce,
                "t": t,
                "Content-Type": "application/json; charset=utf8",
            };
            const res = await fetch(`https://api.switch-bot.com/v1.1/devices/${meter.deviceId}/status`, { headers: statusHeaders });
            const data = await res.json();
            return { ...meter, status: data.body };
        });

        const metersWithStatus = await Promise.all(statusPromises);

        cache = {
            type: 'switchbot',
            data: {
                devices: metersWithStatus
            }
        };
        lastFetchTime = now;
        return cache;

    } catch (error) {
        console.error('Error fetching SwitchBot data:', error);
        return cache || { type: 'switchbot', data: { error: 'Failed to fetch SwitchBot data' } };
    }
};
