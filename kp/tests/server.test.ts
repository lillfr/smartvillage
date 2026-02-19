import request from 'supertest';
import app from './server';

describe('GET /api/news', () => {
  it('should return a list of schedules', async () => {
    const response = await request(app).get('/api/news');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
