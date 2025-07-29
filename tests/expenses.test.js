const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const { setupTestDB, disconnectTestDB, clearTestDB } = require('./setupTestDB')
const User = require('../models/users')
const Expense = require('../models/expenses')

beforeAll(async () => {
  await setupTestDB()
})

afterAll(async () => {
  await disconnectTestDB()
})

describe('Expenses Controller Tests', () => {
  let testUser, authToken, testExpense1, testExpense2

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

    // Create test expenses
    testExpense1 = await Expense.create({
      description: 'Grocery shopping',
      productDetails: { 'Milk': 20, 'Bread': 15, 'Eggs': 15 },
      splitAllocation: { 'Groceries': 50 },
      total: 1150.00,
      spentBy: testUser._id
    })

    testExpense2 = await Expense.create({
      description: 'Movie tickets',
      productDetails: { 'Avengers movie': 25 },
      splitAllocation: { 'Leisure': 25 },
      total: 1125.00,
      spentBy: testUser._id
    })
  })

  describe('GET /api/v1/users/me/expenses', () => {
    test('should return all user expenses with correct format', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /json/)
        console.log(res.body);
        

      expect(res.body).toHaveProperty('nbHit')
      expect(res.body).toHaveProperty('userExpenses')
      expect(res.body.nbHit).toBe(2)
      expect(Array.isArray(res.body.userExpenses)).toBe(true)
    })

    test('should return 403 without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/expenses')
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    test('should return empty array when no expenses exist', async () => {
      await Expense.deleteMany({})
      
      const res = await request(app)
        .get('/api/v1/users/me/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body.nbHit).toBe(0)
      expect(res.body.userExpenses).toHaveLength(0)
    })

    test('should return expenses with correct structure', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const expense = res.body.userExpenses[0]
      expect(expense).toHaveProperty('_id')
      expect(expense).toHaveProperty('description')
      expect(expense).toHaveProperty('productDetails')
      expect(expense).toHaveProperty('splitAllocation')
      expect(expense).toHaveProperty('total')
      expect(expense).toHaveProperty('spentBy')
    })

    test('should only return expenses for authenticated user', async () => {
      // Create another user and expense
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      })

      await Expense.create({
        description: 'Other user expense',
        productDetails: { 'Not visible to test user': 100 },
        splitAllocation: { 'Electronics': 100 },
        total: 100.00,
        spentBy: otherUser._id
      })

      const res = await request(app)
        .get('/api/v1/users/me/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body.nbHit).toBe(2) // Only testUser's expenses
      res.body.userExpenses.forEach(expense => {
        expect(expense.spentBy).toBe(testUser._id.toString())
      })
    })
  })

  describe('GET /api/v1/users/me/expenses/:id', () => {
    test('should return single expense with correct format', async () => {
      const res = await request(app)
        .get(`/api/v1/users/me/expenses/${testExpense1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body).toHaveProperty('singleExpense')
      expect(res.body.singleExpense._id).toBe(testExpense1._id.toString())
      expect(res.body.singleExpense.description).toBe('Grocery shopping')
    })

    test('should return 404 for non-existent expense', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .get(`/api/v1/users/me/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('message', 'Expense not found')
    })

    test('should return 403 without authentication', async () => {
      const res = await request(app)
        .get(`/api/v1/users/me/expenses/${testExpense1._id}`)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('POST /api/v1/users/me/expenses', () => {
    test('should create expense with correct format', async () => {
      const newExpense = {
        description: 'New expense',
        productDetails: { 'Test product': 1175.50 },
        splitAllocation: { 'Utilities': 1175.50 }
      }

      const res = await request(app)
        .post('/api/v1/users/me/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newExpense)
        .expect(200)

      expect(res.body).toHaveProperty('newExpense')
      expect(res.body.newExpense.description).toBe('New expense')
      expect(res.body.newExpense.total).toBe(1175.50)
      expect(res.body.newExpense.spentBy).toBe(testUser._id.toString())
    })

    test('should return 400 for missing description', async () => {
      const invalidExpense = {
        productDetails: { 'Test product': 1175.50 },
        splitAllocation: { 'Utilities': 1175.50 }
      }

      const res = await request(app)
        .post('/api/v1/users/me/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidExpense)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 400 for missing productDetails', async () => {
      const invalidExpense = {
        description: 'Test expense',
        splitAllocation: { 'Utilities': 1175.50 }
      }

      const res = await request(app)
        .post('/api/v1/users/me/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidExpense)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 403 without authentication', async () => {
      const newExpense = {
        description: 'Test expense',
        productDetails: { 'Test product': 1175.50 },
        splitAllocation: { 'Utilities': 1175.50 }
      }

      const res = await request(app)
        .post('/api/v1/users/me/expenses')
        .send(newExpense)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/v1/users/me/expenses/:id', () => {
    test('should update expense with success format', async () => {
      const updateData = {
        description: 'Updated expense',
        splitAllocation: { 'Groceries': 1100.00 }
      }

      const res = await request(app)
        .patch(`/api/v1/users/me/expenses/${testExpense1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data.description).toBe('Updated expense')
      expect(res.body.data.total).toBe(1100.00)
    }) 

    test('should return 404 for non-existent expense', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .patch(`/api/v1/users/me/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated', splitAllocation: { 'Groceries': 1150.00 } })
        .expect(404)

      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('message', 'Expense not found')
    })

    test('should return 403 without authentication', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/me/expenses/${testExpense1._id}`)
        .send({ description: 'Updated', splitAllocation: { 'Groceries': 50.00 } })
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/v1/users/me/expenses/:id', () => {
    test('should delete expense with success format', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/me/expenses/${testExpense1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body).toHaveProperty('success', true)
      expect(res.body).toHaveProperty('message', 'Expense successfully deleted')
    })

    test('should return 404 for non-existent expense', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      
      const res = await request(app)
        .delete(`/api/v1/users/me/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(res.body).toHaveProperty('success', false)
      expect(res.body).toHaveProperty('message', 'Expense not found')
    })

    test('should actually remove expense from database', async () => {
      await request(app)
        .delete(`/api/v1/users/me/expenses/${testExpense1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const deletedExpense = await Expense.findById(testExpense1._id)
      expect(deletedExpense).toBeNull()
    })

    test('should return 403 without authentication', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/me/expenses/${testExpense1._id}`)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })
  })

  describe('Response Format Consistency', () => {
    test('all successful responses should have consistent structure', async () => {
      // Test GET all
      const getAllRes = await request(app)
        .get('/api/v1/users/me/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(getAllRes.body).toHaveProperty('nbHit')
      expect(getAllRes.body).toHaveProperty('userExpenses')

      // Test GET single
      const getSingleRes = await request(app)
        .get(`/api/v1/users/me/expenses/${testExpense1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(getSingleRes.body).toHaveProperty('singleExpense')

      // Test POST
      const postRes = await request(app)
        .post('/api/v1/users/me/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test expense',
          productDetails: { 'Test product': 1150.00 },
          splitAllocation: { 'Groceries': 1150.00 }
        })
        .expect(200)
      expect(postRes.body).toHaveProperty('newExpense')

      // Test PATCH
      const patchRes = await request(app)
        .patch(`/api/v1/users/me/expenses/${testExpense2._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated', splitAllocation: { 'Leisure': 1125.00 } })
        .expect(200)
      expect(patchRes.body).toHaveProperty('success', true)
      expect(patchRes.body).toHaveProperty('data')

      // Test DELETE
      const deleteRes = await request(app)
        .delete(`/api/v1/users/me/expenses/${testExpense2._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      expect(deleteRes.body).toHaveProperty('success', true)
      expect(deleteRes.body).toHaveProperty('message')
    })

    test('all error responses should have consistent structure', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      // Test GET single not found
      const getSingleRes = await request(app)
        .get(`/api/v1/users/me/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
      expect(getSingleRes.body).toHaveProperty('success', false)
      expect(getSingleRes.body).toHaveProperty('message')

      // Test PATCH not found
      const patchRes = await request(app)
        .patch(`/api/v1/users/me/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated', splitAllocation: { 'Groceries': 1150.00 } })
        .expect(404)
      expect(patchRes.body).toHaveProperty('success', false)
      expect(patchRes.body).toHaveProperty('message')

      // Test DELETE not found
      const deleteRes = await request(app)
        .delete(`/api/v1/users/me/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
      expect(deleteRes.body).toHaveProperty('success', false)
      expect(deleteRes.body).toHaveProperty('message')
    })
  })
}) 