import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function AddWidgetModal({ isOpen, onClose, onAdd }) {
    const [plugins, setPlugins] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch('http://localhost:3000/api/available-plugins')
                .then(res => res.json())
                .then(data => {
                    setPlugins(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch plugins:', err);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-700 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Add Widget</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center text-slate-400 py-8">Loading plugins...</div>
                    ) : (
                        <div className="grid gap-3">
                            {plugins.map(plugin => (
                                <button
                                    key={plugin.id}
                                    onClick={() => onAdd(plugin)}
                                    className="flex flex-col items-start p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-all text-left group"
                                >
                                    <span className="text-lg font-semibold text-blue-400 group-hover:text-blue-300">
                                        {plugin.name}
                                    </span>
                                    <span className="text-sm text-slate-400 mt-1">
                                        {plugin.description}
                                    </span>
                                    <span className="text-xs text-slate-500 mt-2 bg-slate-800 px-2 py-1 rounded">
                                        Size: {plugin.defaultW}x{plugin.defaultH}
                                    </span>
                                </button>
                            ))}
                            {plugins.length === 0 && (
                                <div className="text-center text-slate-500 py-4">
                                    No plugins available.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddWidgetModal;
