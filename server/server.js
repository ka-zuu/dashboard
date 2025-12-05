import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for MVP
        methods: ["GET", "POST"]
    }
});

// API Routes
app.get('/api/widgets', async (req, res) => {
    try {
        const widgets = await prisma.widget.findMany();
        res.json(widgets);
    } catch (error) {
        console.error('Error fetching widgets:', error);
        res.status(500).json({ error: 'Failed to fetch widgets' });
    }
});

app.get('/api/available-plugins', (req, res) => {
    const availablePlugins = plugins.map(p => p.meta).filter(Boolean);
    res.json(availablePlugins);
});

app.post('/api/widgets', async (req, res) => {
    try {
        const data = req.body;
        if (Array.isArray(data)) {
            // Bulk update/create
            const operations = data.map(widget =>
                prisma.widget.upsert({
                    where: { id: widget.id },
                    update: {
                        pluginId: widget.pluginId,
                        x: widget.x,
                        y: widget.y,
                        w: widget.w,
                        h: widget.h,
                        settings: typeof widget.settings === 'string' ? widget.settings : JSON.stringify(widget.settings || {})
                    },
                    create: {
                        id: widget.id,
                        pluginId: widget.pluginId,
                        x: widget.x,
                        y: widget.y,
                        w: widget.w,
                        h: widget.h,
                        settings: typeof widget.settings === 'string' ? widget.settings : JSON.stringify(widget.settings || {})
                    }
                })
            );
            const results = await prisma.$transaction(operations);
            res.json(results);
        } else {
            // Single create/update
            const widget = await prisma.widget.upsert({
                where: { id: data.id },
                update: {
                    pluginId: data.pluginId,
                    x: data.x,
                    y: data.y,
                    w: data.w,
                    h: data.h,
                    settings: typeof data.settings === 'string' ? data.settings : JSON.stringify(data.settings || {})
                },
                create: {
                    id: data.id,
                    pluginId: data.pluginId,
                    x: data.x,
                    y: data.y,
                    w: data.w,
                    h: data.h,
                    settings: typeof data.settings === 'string' ? data.settings : JSON.stringify(data.settings || {})
                }
            });
            res.json(widget);
        }
    } catch (error) {
        console.error('Error saving widget:', error);
        res.status(500).json({ error: 'Failed to save widget' });
    }
});

app.delete('/api/widgets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.widget.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting widget:', error);
        res.status(500).json({ error: 'Failed to delete widget' });
    }
});

const prisma = new PrismaClient();
const plugins = [];

// Load plugins
export const loadPlugins = async () => {
    const pluginsDir = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginsDir)) return;

    const files = fs.readdirSync(pluginsDir);
    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                const pluginPath = `file://${path.join(pluginsDir, file)}`;
                const plugin = await import(pluginPath);
                if (plugin.init) {
                    await plugin.init(io);
                }
                plugins.push(plugin);
                console.log(`Loaded plugin: ${file}`);
            } catch (error) {
                console.error(`Failed to load plugin ${file}:`, error);
            }
        }
    }
};

// Start server
const PORT = process.env.PORT || 3000;

const start = async () => {
    await loadPlugins();

    // Periodic update loop (every 1 second)
    setInterval(async () => {
        try {
            const widgets = await prisma.widget.findMany();
            for (const widget of widgets) {
                const plugin = plugins.find(p => p.meta.id === widget.pluginId);
                if (plugin && plugin.getData) {
                    try {
                        const settings = typeof widget.settings === 'string' ? JSON.parse(widget.settings || '{}') : widget.settings;
                        const data = await plugin.getData(settings);
                        io.emit('update', {
                            type: widget.pluginId,
                            widgetId: widget.id,
                            data
                        });
                    } catch (error) {
                        console.error(`Error getting data for widget ${widget.id}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error in update loop:', error);
        }
    }, 1000);

    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

if (process.env.NODE_ENV !== 'test') {
    start();
}

export { app };
