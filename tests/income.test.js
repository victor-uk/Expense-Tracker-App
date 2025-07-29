const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const { setupTestDB, disconnectTestDB, clearTestDB } = require('./setupTestDB')
const User = require('../models/users')
const Income = require('../models/income')

beforeAll(async () => {
  await setupTestDB()
})

afterAll(async () => {
  await disconnectTestDB()
})

describe('Income Controller Tests', () => {
  let testUser, authToken, testIncome1, testIncome2

  beforeEach(async () => {
    await clearTestDB()
    
    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    })

    // Get auth token
    const loginRes = await request(app)
      .post('/api/v1/login/')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
    
    authToken = loginRes.body.token

    // Create test incomes
    testIncome1 = await Income.create({
      description: 'Salary',
      amount: 5000.00,
      category: 'Employment',
      ownedBy: testUser._id
    })

    testIncome2 = await Income.create({
      description: 'Freelance work',
      amount: 1500.00,
      category: 'Freelance',
      ownedBy: testUser._id
    })
  })

  describe('GET /api/v1/users/me/incomes', () => {
    test('should return all user incomes with correct format', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /json/)

      expect(res.body).toHaveProperty('nbHit')
      expect(res.body).toHaveProperty('userIncomes')
      expect(res.body.nbHit).toBe(2)
      expect(Array.isArray(res.body.userIncomes)).toBe(true)
    })

    test('should return 403 without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/incomes')
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    test('should return empty array when no incomes exist', async () => {
      await Income.deleteMany({})
      
      const res = await request(app)
        .get('/api/v1/users/me/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body.nbHit).toBe(0)
      expect(res.body.userIncomes).toHaveLength(0)
    })

    test('should return incomes with correct structure', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const income = res.body.userIncomes[0]
      expect(income).toHaveProperty('_id')
      expect(income).toHaveProperty('description')
      expect(income).toHaveProperty('amount')
      expect(income).toHaveProperty('category')
      expect(income).toHaveProperty('ownedBy')
    })

    test('should only return incomes for authenticated user', async () => {
      // Create another user and income
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      })

      await Income.create({
        description: 'Other user income',
        amount: 3000.00,
        category: 'Employment',
        ownedBy: otherUser._id
      })

      const res = await request(app)
        .get('/api/v1/users/me/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body.nbHit).toBe(2) // Only testUser's incomes
      res.body.userIncomes.forEach(income => {
        expect(income.ownedBy).toBe(testUser._id.toString())
      })
    })
  })

  describe('GET /api/v1/users/me/incomes/:id', () => {
    test('should return single income with success format', async () => {
      const res = await request(app)
        .get(`/api/v1/users/me/incomes/${testIncome1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data._id).toBe(testIncome1._id.toString())
      expect(res.body.data.description).toBe('Salary')
      expect(res.body.data.amount).toBe(5000.00)
    })

    test('should return 404 for non-existent income', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .get(`/api/v1/users/me/incomes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('message', 'Income not found')
    })

    test('should return 403 without authentication', async () => {
      const res = await request(app)
        .get(`/api/v1/users/me/incomes/${testIncome1._id}`)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 500 for invalid income ID format', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/incomes/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('POST /api/v1/users/me/incomes', () => {
    test('should create income with success format', async () => {
      const newIncome = {
        description: 'Bonus payment',
        amount: 1000.00,
        category: 'Bonus'
      }

      const res = await request(app)
        .post('/api/v1/users/me/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newIncome)
        .expect(200)

      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data.description).toBe('Bonus payment')
      expect(res.body.data.amount).toBe(1000.00)
      expect(res.body.data.ownedBy).toBe(testUser._id.toString())
    })

    test('should return 400 for missing description', async () => {
      const invalidIncome = {
        amount: 1000.00,
        category: 'Bonus'
      }

      const res = await request(app)
        .post('/api/v1/users/me/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidIncome)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 400 for missing amount', async () => {
      const invalidIncome = {
        description: 'Bonus payment',
        category: 'Bonus'
      }

      const res = await request(app)
        .post('/api/v1/users/me/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidIncome)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 403 without authentication', async () => {
      const newIncome = {
        description: 'Test income',
        amount: 1000.00,
        category: 'Test'
      }

      const res = await request(app)
        .post('/api/v1/users/me/incomes')
        .send(newIncome)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    test('should handle decimal amounts correctly', async () => {
      const newIncome = {
        description: 'Part-time work',
        amount: 1250.75,
        category: 'Employment'
      }

      const res = await request(app)
        .post('/api/v1/users/me/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newIncome)
        .expect(200)

      expect(res.body.data.amount).toBe(1250.75)
    })
  })

  describe('PATCH /api/v1/users/me/incomes/:id', () => {
    test('should update income with success format', async () => {
      const updateData = {
        description: 'Updated salary',
        amount: 5500.00
      }

      const res = await request(app)
        .patch(`/api/v1/users/me/incomes/${testIncome1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data.description).toBe('Updated salary')
      expect(res.body.data.amount).toBe(5500.00)
    })

    test('should return 404 for non-existent income', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .patch(`/api/v1/users/me/incomes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated' })
        .expect(404)

      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('message', 'Income not found')
    })

    test('should return 403 without authentication', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/me/incomes/${testIncome1._id}`)
        .send({ description: 'Updated' })
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    test('should update only provided fields', async () => {
      const originalAmount = testIncome1.amount
      
      const res = await request(app)
        .patch(`/api/v1/users/me/incomes/${testIncome1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Only description updated' })
        .expect(200)

      expect(res.body.data.description).toBe('Only description updated')
      expect(res.body.data.amount).toBe(originalAmount)
    })
  })

  describe('DELETE /api/v1/users/me/incomes/:id', () => {
    test('should delete income with success format', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/me/incomes/${testIncome1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('message', 'Income deleted successfully')
    })

    test('should return 404 for non-existent income', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .delete(`/api/v1/users/me/incomes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('message', 'Income not found')
    })

    test('should actually remove income from database', async () => {
      await request(app)
        .delete(`/api/v1/users/me/incomes/${testIncome1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const deletedIncome = await Income.findById(testIncome1._id)
      expect(deletedIncome).toBeNull()
    })

    test('should return 403 without authentication', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/me/incomes/${testIncome1._id}`)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 500 for invalid income ID format', async () => {
      const res = await request(app)
        .delete('/api/v1/users/me/incomes/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('Response Format Consistency', () => {
    test('all successful responses should have consistent structure', async () => {
      // Test GET all
      const getAllRes = await request(app)
        .get('/api/v1/users/me/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(getAllRes.body).toHaveProperty('nbHit')
      expect(getAllRes.body).toHaveProperty('userIncomes')

      // Test GET single
      const getSingleRes = await request(app)
        .get(`/api/v1/users/me/incomes/${testIncome1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(getSingleRes.body).toHaveProperty('success', true)
      expect(getSingleRes.body).toHaveProperty('data')

      // Test POST
      const postRes = await request(app)
        .post('/api/v1/users/me/incomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test income',
          amount: 1000.00,
          category: 'Test'
        })
        .expect(200)
      expect(postRes.body).toHaveProperty('success', true)
      expect(postRes.body).toHaveProperty('data')

      // Test PATCH
      const patchRes = await request(app)
        .patch(`/api/v1/users/me/incomes/${testIncome2._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated' })
        .expect(200)
      expect(patchRes.body).toHaveProperty('success', true)
      expect(patchRes.body).toHaveProperty('data')

      // Test DELETE
      const deleteRes = await request(app)
        .delete(`/api/v1/users/me/incomes/${testIncome2._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(deleteRes.body).toHaveProperty('success', true)
      expect(deleteRes.body).toHaveProperty('message')
    })

    test('all error responses should have consistent structure', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      // Test GET single not found
      const getSingleRes = await request(app)
        .get(`/api/v1/users/me/incomes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
      expect(getSingleRes.body).toHaveProperty('success', false)
      expect(getSingleRes.body).toHaveProperty('message')

      // Test PATCH not found
      const patchRes = await request(app)
        .patch(`/api/v1/users/me/incomes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated' })
        .expect(404)
      expect(patchRes.body).toHaveProperty('success', false)
      expect(patchRes.body).toHaveProperty('message')

      // Test DELETE not found
      const deleteRes = await request(app)
        .delete(`/api/v1/users/me/incomes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
      expect(deleteRes.body).toHaveProperty('success', false)
      expect(deleteRes.body).toHaveProperty('message')
    })

    test('all responses should have correct data types', async () => {
      const res = await request(app)
        .get(`/api/v1/users/me/incomes/${testIncome1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(typeof res.body.success).toBe('boolean')
      expect(typeof res.body.data).toBe('object')
      expect(typeof res.body.data.amount).toBe('number')
      expect(typeof res.body.data.description).toBe('string')
    })
  })
}) 