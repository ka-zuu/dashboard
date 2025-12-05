import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const CITIES = [
    { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
    { name: 'Osaka', lat: 34.6937, lon: 135.5023 },
    { name: 'Sapporo', lat: 43.0618, lon: 141.3545 },
    { name: 'Fukuoka', lat: 33.5904, lon: 130.4017 },
    { name: 'Naha', lat: 26.2124, lon: 127.6809 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
];

const WidgetSettingsModal = ({ isOpen, onClose, widget, onSave }) => {
    const [settings, setSettings] = useState('{}');
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        if (widget) {
            const currentSettings = widget.settings || {};
            setSettings(JSON.stringify(currentSettings, null, 2));

            if (widget.pluginId === 'weather') {
                // Try to find matching city
                const match = CITIES.find(c =>
                    Math.abs(c.lat - (currentSettings.latitude || 0)) < 0.01 &&
                    Math.abs(c.lon - (currentSettings.longitude || 0)) < 0.01
                );
                setSelectedCity(match ? match.name : 'Custom');
            }
        }
    }, [widget]);

    const handleSave = () => {
        try {
            let newSettings = JSON.parse(settings);

            // Special handling for weather widget
            if (widget.pluginId === 'weather' && selectedCity !== 'Custom') {
                const city = CITIES.find(c => c.name === selectedCity);
                if (city) {
                    newSettings.latitude = city.lat;
                    newSettings.longitude = city.lon;
                }
            }

            onSave(widget.id, newSettings);
            onClose();
        } catch (e) {
            alert('Invalid JSON settings');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-96 shadow-xl border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Widget Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {widget?.pluginId === 'weather' && (
                        <div className="space-y-2 border-b border-slate-700 pb-4">
                            <h3 className="text-sm font-medium text-slate-300">Location</h3>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">City</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="" disabled>Select a city</option>
                                    {CITIES.map(city => (
                                        <option key={city.name} value={city.name}>{city.name}</option>
                                    ))}
                                    <option value="Custom">Custom (Use JSON)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Advanced (JSON)</label>
                        <textarea
                            value={settings}
                            onChange={(e) => setSettings(e.target.value)}
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded p-3 text-sm text-mono text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center space-x-2 transition-colors"
                    >
                        <Save size={18} />
                        <span>Save Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WidgetSettingsModal;
