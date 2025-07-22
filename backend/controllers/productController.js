const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');

// Create new product => /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  // req.body.images is an array of base64 strings (data URLs)
  if (req.body.images && Array.isArray(req.body.images)) {
    req.body.images = req.body.images.map(img => {
      // Parse contentType from data URL, e.g. "data:image/png;base64,...."
      const matches = img.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        return {
          data: img, // Store the whole data URL for simplicity
          contentType: matches[1]
        };
      }
      return { data: img, contentType: 'image/png' }; // fallback
    });
  }
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// Get all products => /api/v1/products
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const productsCount = await Product.countDocuments();

  console.log(' Before Request Query: ', req.query)
  
  let query = { page: req.query.page, limit: req.query.limit}
  
  console.log('After Request Query: ', query)

  const apiFeatures = new APIFeatures(Product.find(), query)
    .search()
    .filter()
    .pagination(resPerPage);

    console.log('Data from Database for Products: ', APIFeatures)

  const products = await apiFeatures.query;

  console.log('Products: ', products)

  res.status(200).json({
    success: true,
    productsCount,
    resPerPage,
    products: products.map(product => ({
      ...product.toObject(),
      images: product.images.map(imgObj => imgObj.data)
    })),
  });
});

// Get single product details => /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Update Product => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  if (req.body.images && Array.isArray(req.body.images)) {
  req.body.images = req.body.images.map(img => {
    const matches = img.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      return {
        data: img,
        contentType: matches[1]
      };
    }
    return { data: img, contentType: 'image/png' };
  });
}
product = await Product.findByIdAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true,
});

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: 'Product is deleted',
  });
});

// Create new review => /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get Product Reviews => /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Product Review => /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
  });
});
