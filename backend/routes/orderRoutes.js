const express = require('express');
const router = express.Router();
const {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// Public routes
router.route('/new').post(isAuthenticatedUser, newOrder);
router.route('/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/me').get(isAuthenticatedUser, myOrders);

// Admin routes
router
  .route('/admin/orders')
  .get(isAuthenticatedUser, authorizeRoles('admin'), allOrders);

router
  .route('/admin/order/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
