# Finance Dashboard Backend

A robust backend system for a finance dashboard built with Node.js, Express.js, MongoDB, and JWT authentication. This system provides comprehensive financial record management with role-based access control.

## Features

- **User Management**: Create, update, delete users with role assignment
- **Role-Based Access Control**: Three roles (Viewer, Analyst, Admin) with distinct permissions
- **Financial Records CRUD**: Full management of income and expense records
- **Dashboard Analytics**: Summary statistics, category breakdowns, trends, and more
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against brute force and abuse
- **Pagination**: Efficient handling of large datasets
- **Soft Delete**: Records are soft-deleted to preserve data integrity
- **Search Functionality**: Search records by notes, description, or category

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limit
- **Testing**: Jest, Supertest, mongodb-memory-server

## Project Structure

```
src/
├── config/
│   ├── config.js          # Application configuration
│   └── database.js        # MongoDB connection
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── userController.js  # User management logic
│   ├── recordController.js # Financial records logic
│   └── dashboardController.js # Dashboard analytics
├── middleware/
│   ├── auth.js            # JWT authentication
│   ├── authorize.js       # Role-based access control
│   ├── validation.js      # Error handling
│   └── rateLimiter.js     # Rate limiting
├── models/
│   ├── User.js            # User schema
│   ├── FinancialRecord.js # Financial record schema
│   └── index.js
├── routes/
│   ├── auth.js            # Auth routes
│   ├── users.js           # User routes
│   ├── records.js         # Records routes
│   ├── dashboard.js       # Dashboard routes
│   └── index.js
├── utils/
│   └── validationRules.js # Validation schemas
└── server.js              # Application entry point

__tests__/
├── auth.test.js           # Auth API tests
├── records.test.js        # Records API tests
└── dashboard.test.js      # Dashboard API tests
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB v6 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finance-dashboard-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=15
RATE_LIMIT_MAX_REQUESTS=100
```

5. Seed the database (recommended):
```bash
npm run seed
```

This will create:
- 3 test users (admin, analyst, viewer)
- 36 financial records per user (108 total)
- All previous data will be deleted

6. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

7. Run tests:
```bash
npm test
```

### Test Credentials

After running `npm run seed`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@financedashboard.com | `Admin@123` |
| Analyst | analyst@financedashboard.com | `Analyst@123` |
| Viewer | viewer@financedashboard.com | `Viewer@123` |

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

Note: All new users are registered as "viewer" role by default. To assign other roles, an admin must update the user's role via the User Management API.

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Users (Admin Only)

#### Get All Users
```http
GET /api/users?page=1&limit=10&role=viewer&isActive=true
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name",
  "role": "analyst",
  "isActive": true
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Financial Records

#### Create Record
```http
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000,
  "type": "income",
  "category": "Salary",
  "date": "2024-01-15",
  "notes": "Monthly salary",
  "description": "January 2024 salary"
}
```

#### Get Records
```http
GET /api/records?page=1&limit=10&type=income&category=Salary&startDate=2024-01-01&endDate=2024-01-31&sortBy=date&sortOrder=desc
Authorization: Bearer <token>
```

#### Update Record
```http
PUT /api/records/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500,
  "notes": "Updated notes"
}
```

#### Delete Record
```http
DELETE /api/records/:id
Authorization: Bearer <token>
```

#### Search Records
```http
GET /api/records/search?q=grocery&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Categories
```http
GET /api/records/categories
Authorization: Bearer <token>
```

### Dashboard

#### Get Summary
```http
GET /api/dashboard/summary?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Get Category Totals
```http
GET /api/dashboard/categories?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Get Recent Activity
```http
GET /api/dashboard/recent?limit=10
Authorization: Bearer <token>
```

#### Get Trends
```http
GET /api/dashboard/trends?groupBy=month&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Get Monthly Stats
```http
GET /api/dashboard/monthly
Authorization: Bearer <token>
```

#### Get Full Dashboard Data
```http
GET /api/dashboard
Authorization: Bearer <token>
```

## Role Permissions

| Feature | Viewer | Analyst | Admin |
|---------|--------|---------|-------|
| View Records | ✓ | ✓ | ✓ |
| View Summary | ✓ | ✓ | ✓ |
| Create Records | ✗ | ✓ | ✓ |
| Update Records | ✗ | ✗ | ✓ |
| Delete Records | ✗ | ✗ | ✓ |
| Manage Users | ✗ | ✗ | ✓ |

## Data Models

### User
- `email`: String (unique, required)
- `password`: String (required, min 6 chars)
- `name`: String (required)
- `role`: Enum ['viewer', 'analyst', 'admin'] (default: 'viewer')
- `isActive`: Boolean (default: true)
- `lastLogin`: Date
- `createdBy`: ObjectId (ref: User)

### FinancialRecord
- `user`: ObjectId (ref: User, required)
- `amount`: Number (required, min: 0)
- `type`: Enum ['income', 'expense'] (required)
- `category`: String (required, max 50)
- `date`: Date (required, default: now)
- `notes`: String (max 500)
- `description`: String (max 200)
- `isDeleted`: Boolean (default: false, soft delete)

### TokenBlacklist
- `token`: String (required, unique)
- `userId`: ObjectId (ref: User, required)
- `expiresAt`: Date (required)
- `createdAt`: Date (auto-generated)

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [ ... ]  // Optional, for validation errors
}
```

## Security Features

- **JWT Authentication**: Token-based auth with configurable expiration
- **Password Hashing**: bcrypt with configurable salt rounds
- **Rate Limiting**: Configurable request limits per endpoint
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: All inputs validated and sanitized
- **Role-Based Access**: Strict permission enforcement

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/finance_dashboard |
| JWT_SECRET | JWT signing secret | (required) |
| JWT_EXPIRES_IN | Token expiration | 7d |
| BCRYPT_SALT_ROUNDS | Password salt rounds | 10 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 15 (minutes) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |


