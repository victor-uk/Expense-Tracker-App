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

describe('Categories Controller Tests', () => {
  let testUser, testUser2, authToken

  beforeEach(async () => {
    await clearTestDB()
    
    // Create test users
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      categories: ['Groceries', 'Leisure', 'Electronics', 'Utilities', 'Health', 'Uncategorised']
    })

    testUser2 = await User.create({
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123',
      categories: ['Food', 'Transport', 'Entertainment']
    })

    // Get auth token
    const loginRes = await request(app)
      .post('/api/v1/login/')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
    
    authToken = loginRes.body.token
  })

  describe('PATCH /api/v1/users/:id/categories', () => {
    test('should add new category to user with correct format', async () => {
      const newCategory = {
        category: 'Travel'
      }

      const res = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCategory)
        .expect(200)

      expect(res.body).toHaveProperty('categories')
      expect(Array.isArray(res.body.categories)).toBe(true)
      expect(res.body.categories).toContain('Travel')
      expect(res.body.categories).toHaveLength(7) // Original 6 + new 1
    })

    test('should not add duplicate category', async () => {
      const duplicateCategory = {
        category: 'Groceries'
      }

      const res = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateCategory)
        .expect(200)

      expect(res.body.categories).toHaveLength(6) // Should remain the same
      expect(res.body.categories.filter(cat => cat === 'Groceries')).toHaveLength(1)
    })

    test('should return 400 for missing category', async () => {
      const invalidData = {}

      const res = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 400 for empty category string', async () => {
      const invalidData = {
        category: ''
      }

      const res = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 403 without authentication', async () => {
      const newCategory = {
        category: 'Travel'
      }

      const res = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .send(newCategory)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const newCategory = {
        category: 'Travel'
      }

      const res = await request(app)
        .patch(`/api/v1/users/${fakeId}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCategory)
        .expect(404)

      expect(res.body).toHaveProperty('error')
    })

    test('should handle case-sensitive category names', async () => {
      const newCategory = {
        category: 'TRAVEL'
      }

      const res = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCategory)
        .expect(200)

      expect(res.body.categories).toContain('TRAVEL')
    })

    test('should preserve existing categories when adding new one', async () => {
      const originalCategories = [...testUser.categories]
      const newCategory = {
        category: 'Travel'
      }

      const res = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCategory)
        .expect(200)

      originalCategories.forEach(category => {
        expect(res.body.categories).toContain(category)
      })
      expect(res.body.categories).toContain('Travel')
    })
  })

  describe('DELETE /api/v1/users/:id/categories', () => {
    test('should remove category from user with correct format', async () => {
      const categoryToRemove = {
        category: 'Leisure'
      }

      const res = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryToRemove)
        .expect(200)

      expect(res.body).toHaveProperty('categories')
      expect(res.body).toHaveProperty('expensesWithCategory')
      expect(Array.isArray(res.body.categories)).toBe(true)
      expect(res.body.categories).not.toContain('Leisure')
      expect(res.body.categories).toHaveLength(5) // Original 6 - 1 removed
    })

    test('should return 400 for missing category', async () => {
      const invalidData = {}

      const res = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 400 for empty category string', async () => {
      const invalidData = {
        category: ''
      }

      const res = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 403 without authentication', async () => {
      const categoryToRemove = {
        category: 'Leisure'
      }

      const res = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .send(categoryToRemove)
        .expect(403)

      expect(res.body).toHaveProperty('error')
    })

    test('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const categoryToRemove = {
        category: 'Leisure'
      }

      const res = await request(app)
        .delete(`/api/v1/users/${fakeId}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryToRemove)
        .expect(404)

      expect(res.body).toHaveProperty('error')
    })

    test('should handle removing non-existent category gracefully', async () => {
      const nonExistentCategory = {
        category: 'NonExistentCategory'
      }

      const res = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(nonExistentCategory)
        .expect(200)

      expect(res.body.categories).toHaveLength(6) // Should remain the same
    })

    test.only('should update expenses with removed category to Uncategorised', async () => {
      // Create an expense with the category that will be removed
      await Expense.create({
        description: 'Test expense',
        productDetails: {'Test product': 100.00 },
        spentBy: testUser._id,
        splitAllocation: {
          'Leisure': 100.00
        },
        total: 100.00
      })

      const categoryToRemove = {
        category: 'Leisure'
      }

      const res = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryToRemove)
        .expect(200)

      expect(res.body.expensesWithCategory).toBeDefined()
      
      // Verify the expense was updated
      const updatedExpense = await Expense.findOne({ spentBy: testUser._id })
      expect(updatedExpense.splitAllocation.Uncategorised).toBe(100.00)
      expect(updatedExpense.splitAllocation.Leisure).toBeUndefined()
    })

    test('should preserve other categories when removing one', async () => {
      const categoryToRemove = {
        category: 'Leisure'
      }

      const res = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryToRemove)
        .expect(200)

      expect(res.body.categories).toContain('Groceries')
      expect(res.body.categories).toContain('Electronics')
      expect(res.body.categories).toContain('Utilities')
      expect(res.body.categories).toContain('Health')
      expect(res.body.categories).toContain('Uncategorised')
      expect(res.body.categories).not.toContain('Leisure')
    })

    test('should handle case-sensitive category removal', async () => {
      // First add a case-sensitive category
      await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'TRAVEL' })
        .expect(200)

      // Then remove it
      const res = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'TRAVEL' })
        .expect(200)

      expect(res.body.categories).not.toContain('TRAVEL')
    })
  })

  describe('Response Format Consistency', () => {
    test('all successful responses should have consistent structure', async () => {
      // Test PATCH (add category)
      const patchRes = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'Travel' })
        .expect(200)
      expect(patchRes.body).toHaveProperty('categories')
      expect(Array.isArray(patchRes.body.categories)).toBe(true)

      // Test DELETE (remove category)
      const deleteRes = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'Travel' })
        .expect(200)
      expect(deleteRes.body).toHaveProperty('categories')
      expect(deleteRes.body).toHaveProperty('expensesWithCategory')
      expect(Array.isArray(deleteRes.body.categories)).toBe(true)
    })

    test('all error responses should have consistent structure', async () => {
      // Test PATCH with missing category
      const patchRes = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)
      expect(patchRes.body).toHaveProperty('error')

      // Test DELETE with missing category
      const deleteRes = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)
      expect(deleteRes.body).toHaveProperty('error')
    })

    test('all responses should have correct data types', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'Travel' })
        .expect(200)

      expect(Array.isArray(res.body.categories)).toBe(true)
      res.body.categories.forEach(category => {
        expect(typeof category).toBe('string')
      })
    })

    test('category operations should maintain data integrity', async () => {
      // Add a category
      const addRes = await request(app)
        .patch(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'Travel' })
        .expect(200)

      const categoriesAfterAdd = addRes.body.categories
      expect(categoriesAfterAdd).toContain('Travel')

      // Remove the category
      const removeRes = await request(app)
        .delete(`/api/v1/users/${testUser._id}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'Travel' })
        .expect(200)

      const categoriesAfterRemove = removeRes.body.categories
      expect(categoriesAfterRemove).not.toContain('Travel')

      // Verify the user was actually updated in the database
      const updatedUser = await User.findById(testUser._id)
      expect(updatedUser.categories).not.toContain('Travel')
    })
  })
}) 