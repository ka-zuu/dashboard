import request from 'supertest';
import { app, loadPlugins } from '../server.js';

describe('GET /api/available-plugins', () => {
    beforeAll(async () => {
        await loadPlugins();
    });

    it('should return a list of available plugins', async () => {
        const response = await request(app).get('/api/available-plugins');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });
});
