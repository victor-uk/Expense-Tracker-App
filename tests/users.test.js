const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const { setupTestDB, disconnectTestDB, clearTestDB } = require('./setupTestDB')
const User = require('../models/users')

beforeAll(async () => {
  await setupTestDB()
})

afterAll(async () => {
  await disconnectTestDB()
})

describe('Users Controller Tests', () => {
  let testUser1, testUser2, testUser3, authToken

  beforeEach(async () => {
    await clearTestDB()

    // Create test users
    testUser1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    })

    testUser2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password456'
    })

    testUser3 = await User.create({
      name: 'Bob Wilson',
      email: 'bob@example.com',
      password: 'password789'
    })

    const loginRes = await request(app).post('/api/v1/login/').send({
      email: 'john@example.com',
      password: 'password123'
    })

    authToken = loginRes.body.token
  })

  describe('GET /api/v1/users', () => {
    test('should return all users with success format', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /json/)

      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('data')
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(3)
    })

    test('should return users with correct structure', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const user = res.body.data[0]
      expect(user).toHaveProperty('_id')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('income')
      expect(user).toHaveProperty('categories')
      expect(user).toHaveProperty('createdAt')
      expect(user).not.toHaveProperty('password')
    })

    test('should return empty array when no users exist', async () => {
      await User.deleteMany({})

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveLength(0)
    })
  })

  describe('GET /api/v1/users/:id', () => {
    test('should return single user with success format', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUser1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /json/)

      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data._id).toBe(testUser1._id.toString())
      expect(res.body.data.name).toBe('John Doe')
      expect(res.body.data.email).toBe('john@example.com')
    })

    test('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      const res = await request(app).get(`/api/v1/users/${fakeId}`).set('Authorization', `Bearer ${authToken}`).expect(404)

      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('message', 'User not found')
    })

    test('should return 400 for invalid user ID format', async () => {
      const res = await request(app)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400) // Mongoose throws error for invalid ObjectId

      expect(res.body).toHaveProperty('error')
    })

    test('should not return password in response', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUser1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body.data).not.toHaveProperty('password')
    })
  })

  describe('PATCH /api/v1/users/:id', () => {
    test('should update user with success format', async () => {
      const updateData = {
        name: 'John Updated',
        email: 'john.updated@example.com'
      }

      const res = await request(app)
        .patch(`/api/v1/users/${testUser1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data.name).toBe('John Updated')
      expect(res.body.data.email).toBe('john.updated@example.com')
    })

    test('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      const res = await request(app)
        .patch(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(404)

      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('message', 'User not found')
    })

    test('should validate email format', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${testUser1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' })
        .expect(400) // Mongoose validation error

      expect(res.body).toHaveProperty('error')
    })

    test('should update only provided fields', async () => {
      const originalEmail = testUser1.email

      const res = await request(app)
        .patch(`/api/v1/users/${testUser1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Only Name Updated' })
        .expect(200)

      expect(res.body.data.name).toBe('Only Name Updated')
      expect(res.body.data.email).toBe(originalEmail)
    })
  })

  describe('DELETE /api/v1/users/:id', () => {
    test('should delete user with success format', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUser1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('message', 'User deleted successfully')
    })

    test('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      const res = await request(app)
        .delete(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('message', 'User not found')
    })

    test('should actually remove user from database', async () => {
      await request(app)
        .delete(`/api/v1/users/${testUser1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const deletedUser = await User.findById(testUser1._id)
      expect(deletedUser).toBeNull()
    })

    test('should return 400 for invalid user ID format', async () => {
      const res = await request(app)
        .delete('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('Response Format Consistency', () => {
    test('all successful responses should have success: true', async () => {
      // Test GET all
      const getAllRes = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(getAllRes.body.success).toBe(true)

      // Test GET single
      const getSingleRes = await request(app)
        .get(`/api/v1/users/${testUser1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(getSingleRes.body.success).toBe(true)

      // Test PATCH
      const patchRes = await request(app)
        .patch(`/api/v1/users/${testUser1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Update' })
        .expect(200)
      expect(patchRes.body.success).toBe(true)

      // Test DELETE
      const deleteRes = await request(app)
        .delete(`/api/v1/users/${testUser2._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(deleteRes.body.success).toBe(true)
    })

    test('all error responses should have success: false', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      // Test GET single not found
      const getSingleRes = await request(app)
        .get(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
      expect(getSingleRes.body.success).toBe(false)

      // Test PATCH not found
      const patchRes = await request(app)
        .patch(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
        .expect(404)
      expect(patchRes.body.success).toBe(false)

      // Test DELETE not found
      const deleteRes = await request(app)
        .delete(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
      expect(deleteRes.body.success).toBe(false)
    })

    test('all responses should have consistent data structure', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUser1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body).toHaveProperty('success')
      expect(res.body).toHaveProperty('data')
      expect(typeof res.body.success).toBe('boolean')
      expect(typeof res.body.data).toBe('object')
    })
  })
})
