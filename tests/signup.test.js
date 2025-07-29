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

describe('POST /auth/signup', () => {
  const signupDetails = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  }

  test('should return user profile if registered ', async () => {
    const res = await request(app)
      .post('/api/v1/signup/')
      .send(signupDetails)
      .expect(201)
      .expect('Content-Type', /json/)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('name')
    expect(res.body.user).toHaveProperty('email')
    await clearTestDB()
  })

  test('should return message: Registration successful', async () => {
    const res = await request(app).post('/api/v1/signup/').send(signupDetails)
    expect(res.body.message).toBe('Registration successful')
    await clearTestDB()
  })

  test('should return access token', async () => {
    const res = await request(app).post('/api/v1/signup/').send(signupDetails)
    
    expect(res.body.token).toBeDefined()
    await clearTestDB()
  })

  // Edge Cases - Missing Required Fields
  describe('Missing Required Fields', () => {
    test('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({})
        .expect(400)

        console.log(res.body)
        
      expect(res.body.error).toBe('Invalid user credentials ')
      await clearTestDB()
    })

    test('should return 400 when name is missing', async () => {
      const { name, ...detailsWithoutName } = signupDetails
      const res = await request(app)
        .post('/api/v1/signup/')
        .send(detailsWithoutName)
        .expect(400)
      expect(res.body.error).toBe('Invalid user credentials ')
      await clearTestDB()
    })
  })

  // Edge Cases - Password Validation
  describe('Password Validation', () => {
    test('should return 400 when password is too short (< 8 characters)', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({
          ...signupDetails,
          password: 'short'
        })
        .expect(400)
      expect(res.body.error).toBe('Password length must be between 8 and 20 characters')
      await clearTestDB()
    })

    test('should return 400 when password is too long (> 20 characters)', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({
          ...signupDetails,
          password: 'thispasswordiswaytoolongforvalidation'
        })
        .expect(400)
      expect(res.body.error).toBe('Password length must be between 8 and 20 characters')
      await clearTestDB()
    })

    test('should accept password with exactly 8 characters', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({
          ...signupDetails,
          password: '12345678'
        })
        .expect(201)
      expect(res.body.message).toBe('Registration successful')
      await clearTestDB()
    })
  })

  // Edge Cases - Name Validation
  describe('Name Validation', () => {
    test('should return 400 when name is too short (< 2 characters)', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({
          ...signupDetails,
          name: 'A'
        })
        .expect(400)
      expect(res.body.error).toContain('Name must exceed length')
      await clearTestDB()
    })

    test('should return 400 when name is too long (> 20 characters)', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({
          ...signupDetails,
          name: 'This is a very long name that exceeds the limit'
        })
        .expect(400)
      expect(res.body.error).toContain('Name cannot exceed length')
      await clearTestDB()
    })

    test('should handle name with special characters', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({
          ...signupDetails,
          name: 'José María O\'Connor'
        })
        .expect(201)
      expect(res.body.message).toBe('Registration successful')
      await clearTestDB()
    })
  })

  // Edge Cases - Email Validation
  describe('Email Validation', () => {
    test('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({
          ...signupDetails,
          email: 'invalidemail.com'
        })
        .expect(400)
      expect(res.body.error).toBe('Invalid user credentials')
      await clearTestDB()
    })

    test('should accept valid email with subdomain', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({
          ...signupDetails,
          email: 'test@sub.example.com'
        })
        .expect(201)
      expect(res.body.message).toBe('Registration successful')
      await clearTestDB()
    })

    test('should trim whitespace from email and accept', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({
          ...signupDetails,
          email: '  test@example.com  '
        })
        .expect(201)
      expect(res.body.message).toBe('Registration successful')
      expect(res.body.user.email).toBe('test@example.com')
      await clearTestDB()
    })
  })

  // Edge Cases - Duplicate Email
  describe('Duplicate Email Registration', () => {
    test('should return 400 when trying to register with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/v1/signup/')
        .send(signupDetails)
        .expect(201)

      // Second registration with same email
      const res = await request(app)
        .post('/api/v1/signup/')
        .send(signupDetails)
        .expect(400)
      
      expect(res.body.error).toContain('email already exists')
      await clearTestDB()
    })
  })

  // Edge Cases - Data Types
  describe('Data Type Validation', () => {
    test('should return 400 when fields are not strings', async () => {
      const res = await request(app)
        .post('/api/v1/signup/')
        .send({
          name: 123,
          email: 456,
          password: 789
        })
        .expect(400)
      expect(res.body.error).toBe('Invalid user credentials')
      await clearTestDB()
    })
  })
})

