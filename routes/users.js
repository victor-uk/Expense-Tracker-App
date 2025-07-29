const { Router } = require('express')
const router = Router({mergeParams: true})
const { verifyUser } = require('../middleware/authentication')
const {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser
} = require('../controllers/users')
const {
  updateUserCategory,
  deleteUserCategory
} = require('../controllers/categories')
const { validateCategory } = require('../middleware/validation')

// Apply authentication to all routes
router.use(verifyUser)

router.route('/').get(getAllUsers)
router.route('/:id').get(getSingleUser).patch(updateUser).delete(deleteUser)
router
  .route('/:id/categories')
  .patch(validateCategory, updateUserCategory)
  .delete(validateCategory, deleteUserCategory)

module.exports = router
