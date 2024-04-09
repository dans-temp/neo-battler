// server.test.js
const request = require('supertest');
const app = require('../server/server');

describe('GET /api/job_data', () => {
  it('responds with JSON containing job data', async () => {
    const response = await request(app).get('/api/job_data');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('warrior');
    expect(response.body).toHaveProperty('thief');
    expect(response.body).toHaveProperty('mage');
  });
});

describe('POST /api/create/:job/:name', () => {
  it('creates a new character', async () => {
    const response = await request(app).post('/api/create/warrior/John');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('character');
    expect(response.body.character.name).toBe('John');
    expect(response.body.character.job).toBe('warrior');
  });

  it('returns 400 with invalid name', async () => {
    const response = await request(app).post('/api/create/warrior/1');
    expect(response.status).toBe(400);
  });
});

describe('PUT /api/character_name/:old_name', () => {
  it('updates character name', async () => {
    // Assuming there's a character named "John" created before
    const response = await request(app).put('/api/character_name/John').send({ new_name: 'NewJohn' });
    expect(response.status).toBe(200);
    // Check if the character's name is updated in the response
    expect(response.body).toBe(0); // assuming it returns the index of the character
  });

  it('returns 404 if character not found', async () => {
    const response = await request(app).put('/api/character_name/NonExisting').send({ new_name: 'NewName' });
    expect(response.status).toBe(404);
  });

  it('returns 400 with invalid new name', async () => {
    const response = await request(app).put('/api/character_name/OldName').send({ new_name: '1' });
    expect(response.status).toBe(400);
  });
});


