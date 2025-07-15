# E-commerce Backend

A full-featured e-commerce backend built with Node.js, Express, and MongoDB, following the MVC architecture pattern.

## Features

- User authentication and authorization
- Product management
- Order processing
- File uploads
- API documentation
- Error handling
- Security best practices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/logout` - Logout user

### Products

- `GET /api/products` - Get all products
- `GET /api/product/:id` - Get single product
- `POST /api/admin/product/new` - Create new product (admin)
- `PUT /api/admin/product/:id` - Update product (admin)
- `DELETE /api/admin/product/:id` - Delete product (admin)

### Orders

- `POST /api/order/new` - Create new order
- `GET /api/order/:id` - Get single order
- `GET /api/orders/me` - Get logged in user orders
- `GET /api/admin/orders/` - Get all orders (admin)

### Users

- `GET /api/me` - Get user profile
- `PUT /api/password/update` - Update password
- `PUT /api/me/update` - Update profile

## Project Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/           # Mongoose models
├── routes/           # Route definitions
├── utils/            # Utility classes and functions
├── uploads/          # File uploads
├── .env              # Environment variables
├── package.json      # Project metadata and dependencies
└── server.js         # Application entry point
```

## Security

- Authentication using JWT
- Password hashing with bcryptjs
- Input validation
- Rate limiting
- XSS protection
- CORS enabled

## License

This project is licensed under the MIT License.
