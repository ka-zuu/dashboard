import React from 'react';
import { Thermometer, Droplets, Battery } from 'lucide-react';

const SwitchBotWidget = ({ data }) => {
    if (!data) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="text-slate-400">Loading SwitchBot...</div>
            </div>
        );
    }

    if (data.error) {
        return (
            <div className="h-full flex items-center justify-center bg-red-900/20 rounded-xl border border-red-800">
                <div className="text-red-400 p-4 text-center text-sm">{data.error}</div>
            </div>
        );
    }

    if (!data.devices) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="text-slate-400">Loading Devices...</div>
            </div>
        );
    }

    // Filter for Meters (Temperature/Humidity)
    const meters = data.devices.filter(d => d.deviceType === 'Meter' || d.deviceType === 'MeterPlus' || d.deviceType === 'Hub Mini');

    if (meters.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="text-slate-400">No Meters found</div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg border border-slate-700 overflow-y-auto">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Environment</h3>
            <div className="space-y-3">
                {meters.map(meter => (
                    <div key={meter.deviceId} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-200">{meter.deviceName}</span>
                            {/* Battery icon could go here if available in status */}
                        </div>

                        {meter.status ? (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-2">
                                    <Thermometer size={16} className="text-orange-400" />
                                    <span className="text-lg font-bold text-white">
                                        {meter.status.temperature}<span className="text-sm text-slate-400">°C</span>
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Droplets size={16} className="text-blue-400" />
                                    <span className="text-lg font-bold text-white">
                                        {meter.status.humidity}<span className="text-sm text-slate-400">%</span>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-500">No status data</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SwitchBotWidget;
