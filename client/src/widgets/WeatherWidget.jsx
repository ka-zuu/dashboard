import React from 'react';

const WeatherWidget = ({ data }) => {
    const temperature = data?.temperature ?? '--';
    const weatherCode = data?.weathercode ?? '--';
    const location = data?.location ?? 'Unknown';

    // Simple weather code mapping (can be expanded)
    const getWeatherIcon = (code) => {
        if (code === 0) return '☀️';
        if (code >= 1 && code <= 3) return '⛅';
        if (code >= 45 && code <= 48) return '🌫️';
        if (code >= 51 && code <= 67) return '🌧️';
        if (code >= 71 && code <= 77) return '❄️';
        return '❓';
    };

    return (
        <div className="h-full w-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 flex flex-col items-center justify-center shadow-lg text-white">
            <div className="text-sm font-medium uppercase tracking-wider mb-1 opacity-80">{location}</div>
            <div className="text-5xl mb-2">{getWeatherIcon(weatherCode)}</div>
            <div className="text-3xl font-bold">{temperature}°C</div>
        </div>
    );
};

export default WeatherWidget;
