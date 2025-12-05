import React, { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Settings, Plus, Trash2, Save } from 'lucide-react';

import ClockWidget from './widgets/ClockWidget';
import WeatherWidget from './widgets/WeatherWidget';
import SwitchBotWidget from './components/widgets/SwitchBotWidget';
import AddWidgetModal from './components/AddWidgetModal';
import WidgetSettingsModal from './components/WidgetSettingsModal';

// Connect to backend
const socket = io('http://localhost:3000');

const API_URL = 'http://localhost:3000/api/widgets';

function App() {
    const [widgetData, setWidgetData] = useState({});
    const [layout, setLayout] = useState([]);
    const [widgets, setWidgets] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState(null);

    // Fetch widgets on mount
    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const formattedLayout = data.map(w => ({
                        i: w.id,
                        x: w.x,
                        y: w.y,
                        w: w.w,
                        h: w.h,
                        minW: 2, minH: 2
                    }));
                    setLayout(formattedLayout);
                    setWidgets(data);
                } else {
                    // Default layout if DB is empty
                    const defaultWidgets = [
                        { id: 'clock-1', pluginId: 'clock', x: 0, y: 0, w: 4, h: 4, settings: {} },
                        { id: 'weather-1', pluginId: 'weather', x: 4, y: 0, w: 4, h: 4, settings: {} }
                    ];
                    setWidgets(defaultWidgets);
                    setLayout(defaultWidgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h, minW: 2, minH: 2 })));
                }
            })
            .catch(err => console.error('Failed to fetch widgets:', err));
    }, []);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('update', (data) => {
            // data structure: { type, widgetId, data }
            if (data.widgetId) {
                setWidgetData(prev => ({
                    ...prev,
                    [data.widgetId]: data.data
                }));
            }
        });

        return () => {
            socket.off('connect');
            socket.off('update');
        };
    }, []);

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
    };

    const saveLayout = useCallback(() => {
        const widgetsToSave = layout.map(l => {
            const widget = widgets.find(w => w.id === l.i);
            return {
                id: l.i,
                pluginId: widget ? widget.pluginId : 'clock', // Fallback
                x: l.x,
                y: l.y,
                w: l.w,
                h: l.h,
                settings: widget ? widget.settings : {}
            };
        });

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(widgetsToSave)
        })
            .then(res => res.json())
            .then(() => alert('Layout saved!'))
            .catch(err => console.error('Failed to save layout:', err));
    }, [layout, widgets]);

    const handleAddWidget = (plugin) => {
        const newWidgetId = `${plugin.id}-${Date.now()}`;
        const newWidget = {
            id: newWidgetId,
            pluginId: plugin.id,
            x: 0,
            y: Infinity, // Puts it at the bottom
            w: plugin.defaultW || 2,
            h: plugin.defaultH || 2,
            settings: {}
        };

        setWidgets([...widgets, newWidget]);
        setLayout([...layout, {
            i: newWidgetId,
            x: newWidget.x,
            y: newWidget.y,
            w: newWidget.w,
            h: newWidget.h,
            minW: 2, minH: 2
        }]);
        setIsAddModalOpen(false);
    };

    const handleDeleteWidget = (widgetId) => {
        if (!confirm('Are you sure you want to delete this widget?')) return;

        // Optimistic update
        setWidgets(widgets.filter(w => w.id !== widgetId));
        setLayout(layout.filter(l => l.i !== widgetId));

        fetch(`${API_URL}/${widgetId}`, {
            method: 'DELETE'
        }).catch(err => {
            console.error('Failed to delete widget:', err);
            // Could revert here if needed
        });
    };

    const handleSaveSettings = (widgetId, newSettings) => {
        const updatedWidgets = widgets.map(w =>
            w.id === widgetId ? { ...w, settings: newSettings } : w
        );
        setWidgets(updatedWidgets);

        // Persist immediately
        const widgetToSave = updatedWidgets.find(w => w.id === widgetId);
        if (widgetToSave) {
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(widgetToSave)
            }).catch(err => console.error('Failed to save widget settings:', err));
        }
    };

    const renderWidget = (item) => {
        const widget = widgets.find(w => w.id === item.i);
        const pluginId = widget ? widget.pluginId : (item.i.startsWith('clock') ? 'clock' : 'weather');
        const data = widgetData[item.i];

        let content = null;
        if (pluginId === 'clock') {
            content = <ClockWidget data={data} />;
        } else if (pluginId === 'weather') {
            content = <WeatherWidget data={data} />;
        } else if (pluginId === 'switchbot') {
            content = <SwitchBotWidget data={data} />;
        } else {
            content = <div className="text-white p-4">Unknown Widget: {pluginId}</div>;
        }

        return (
            <div key={item.i} className="relative group h-full">
                {/* Drag handle - only visible in Edit Mode */}
                {isEditMode && (
                    <>
                        <div className="drag-handle absolute top-2 left-2 p-1 cursor-move z-20 bg-slate-700/80 rounded hover:bg-slate-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M15 5l-3-3-3 3M5 15l-3-3 3-3M9 19l3 3 3-3M19 15l3-3-3-3M15 19l-3 3-3-3" /></svg>
                        </div>
                        <button
                            onClick={() => setEditingWidget(widget)}
                            className="absolute top-2 right-10 p-1 cursor-pointer z-20 bg-blue-900/80 rounded hover:bg-blue-700 transition-colors text-blue-200"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            onClick={() => handleDeleteWidget(item.i)}
                            className="absolute top-2 right-2 p-1 cursor-pointer z-20 bg-red-900/80 rounded hover:bg-red-700 transition-colors text-red-200"
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                )}
                {content}
            </div>
        );
    };

    return (
        <div className="min-h-screen p-8">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-100">Smart Home Dashboard</h1>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${isEditMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Settings size={18} />
                            <span>{isEditMode ? 'Done' : 'Edit'}</span>
                        </button>
                    </div>

                    {isEditMode && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                            <span>Add Widget</span>
                        </button>
                    )}

                    {isEditMode && (
                        <button
                            onClick={saveLayout}
                            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <Save size={18} />
                            <span>Save</span>
                        </button>
                    )}
                </div>
            </header>

            <GridLayout
                className="layout"
                layout={layout}
                cols={12}
                rowHeight={30}
                width={1200}
                onLayoutChange={handleLayoutChange}
                draggableHandle=".drag-handle"
                isDraggable={isEditMode}
                isResizable={isEditMode}
            >
                {layout.map(item => renderWidget(item))}
            </GridLayout>

            <AddWidgetModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddWidget}
            />

            <WidgetSettingsModal
                isOpen={!!editingWidget}
                onClose={() => setEditingWidget(null)}
                widget={editingWidget}
                onSave={handleSaveSettings}
            />
        </div>
    );
}

export default App;
