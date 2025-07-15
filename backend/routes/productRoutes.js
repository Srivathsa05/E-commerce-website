const express = require('express');
const router = express.Router();
const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// Public routes
router.route('/').get(getProducts);  // Changed from '/products' to '/'
router.route('/:id').get(getSingleProduct);  // Changed from '/product/:id' to '/:id'
router.route('/:id/reviews').get(getProductReviews);  // Changed from '/reviews' to '/:id/reviews'

// Protected routes (require authentication)
router.route('/:id/review').put(isAuthenticatedUser, createProductReview);  // Changed from '/review' to '/:id/review'
router.route('/reviews').delete(isAuthenticatedUser, deleteReview);

// Admin routes
router
  .route('/admin/new')
  .post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);  // Changed from '/admin/product/new' to '/admin/new'

router
  .route('/admin/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)  // Changed from '/admin/product/:id' to '/admin/:id'
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;
