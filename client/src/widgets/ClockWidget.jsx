import React from 'react';

const ClockWidget = ({ data }) => {
    const time = data?.time ? new Date(data.time).toLocaleTimeString() : '--:--:--';

    return (
        <div className="h-full w-full bg-slate-800 rounded-lg p-4 flex flex-col items-center justify-center shadow-lg border border-slate-700">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Current Time</h3>
            <div className="text-4xl font-bold text-white font-mono">
                {time}
            </div>
        </div>
    );
};

export default ClockWidget;
