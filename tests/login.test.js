const request = require('supertest')
const connectDB = require('../db/connect')
const mongoose = require('mongoose')
const app = require('../app')
const { setupTestDB, disconnectTestDB, clearTestDB } = require('./setupTestDB')

beforeAll(async () => {
    await setupTestDB()
  })
  
  afterAll(async () => {
    await disconnectTestDB()
  })

  describe.only('POST /auth/login', () => {
    const signupDetails = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

    beforeAll(async () => {
      const signupRes = await request(app)
        .post('/api/v1/signup/')
        .send(signupDetails)
    })
  
    const userCredentials = {
      email: 'test@example.com',
      password: 'password123'
    }
  
    test('should return user credentials', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send(userCredentials)
        .expect(200)
        .expect('Content-Type', /json/)
      expect(res.body).toHaveProperty('user')
      expect(res.body.user).toHaveProperty('email')
    })
  
    test('should return message "Login successful"', async () => {
      const res = await request(app).post('/api/v1/login/').send(userCredentials)
      expect(res.body.message).toBe('Login successful')
    })
  
    test('should return access token', async () => {
      const res = await request(app).post('/api/v1/login/').send(userCredentials)
      expect(res.body.token).toBeDefined()
    })

    test('should return 400 for missing email', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send({ password: 'password123' })
        .expect(400)
      expect(res.body.error).toBe('Invalid user credentials')
    })

    test('should return 400 for missing password', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send({ email: 'test@example.com' })
        .expect(400)
      expect(res.body.error).toBe('Invalid user credentials')
    })

    test('should return 400 for empty request body', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send({})
        .expect(400)
      expect(res.body.error).toBe('Invalid user credentials')
    })

    test('should return 403 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(403)
      expect(res.body.error).toBe('Forbidden')
    })

    test('should return 403 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(403)
      expect(res.body.error).toBe('Invalid credentials')
    })

    test('should return 400 for password too short', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send({ email: 'test@example.com', password: 'short' })
        .expect(400)
      expect(res.body.error).toBe('Invalid user credentials')
    })

    test('should return 400 for password too long', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send({ email: 'test@example.com', password: 'thispasswordiswaytoolongandshouldfailvalidation' })
        .expect(400)
      expect(res.body.error).toBe('Invalid user credentials')
    })

    test('should return user object with correct structure', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send(userCredentials)
        .expect(200)
      
      expect(res.body.user).toHaveProperty('_id')
      expect(res.body.user).toHaveProperty('name')
      expect(res.body.user).toHaveProperty('email')
      expect(res.body.user.name).toBe('Test User')
      expect(res.body.user.email).toBe('test@example.com')
    })

    test('should return valid JWT token', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send(userCredentials)
        .expect(200)
      
      expect(res.body.token).toBeDefined()
      expect(typeof res.body.token).toBe('string')
      expect(res.body.token.length).toBeGreaterThan(0)
    })

    test('should handle case insensitive email', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send({ email: 'TEST@EXAMPLE.COM', password: 'password123' })
        .expect(200)
      
      expect(res.body.user.email).toBe('test@example.com')
    })

    test('should return correct status code for successful login', async () => {
      const res = await request(app)
        .post('/api/v1/login/')
        .send(userCredentials)
        .expect(200)
      
      expect(res.status).toBe(200)
    })

    afterAll(async () => {
      await clearTestDB()
    })
  })
  