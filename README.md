# Library Management System

RESTful API built with Node.js, Express, and PostgreSQL for managing books, borrowers, and borrowing operations.

## Features

- **Book Management**: Complete CRUD operations for books with search capabilities
- **Borrower Management**: Register, update, delete, and list borrowers with pagination
- **Borrowing Workflow**: Checkout and return flows with transactional integrity
- **Overdue Tracking**: Identify and list overdue borrowings
- **Reporting & Exports**: Borrowing analytics and CSV/XLSX exports
- **Rate Limiting**: Protection on heavy reports endpoints
- **Authentication**: JWT-based access control for protected routes
- **Error Handling**: Unified response format with centralized error handling

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Knex (migrations)

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL

### 1) Installation

1. Clone the repository:

```bash
git clone https://github.com/abdallaNasser1432/library-management-system.git
```

2. Move into the project folder:

```bash
cd library-management-system
```

3. Install dependencies:

```bash
npm install
```

4. Configure environment variables:

```bash
# Copy environment template
cp env.example .env
# Edit .env with your database credentials and settings
```

### 2) Database Setup

1. Create the database in your PostgreSQL Server:

```sql
CREATE DATABASE library_db;
```

2. Run migrations:

```bash
npm run migrate:latest
```

### 3) Run the Server

Development (watch mode):

```bash
npm run dev
```

Production:

```bash
npm start
```

Server defaults to `http://localhost:3000` (or `PORT` from `.env`).

## Configuration

#### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_db
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

## API Overview

Base URL: `/api`

### Health Check

- `GET /health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

Notes:

- Protected endpoints require `Authorization: Bearer <token>`.
- Protected endpoints:
  - Books: `POST /api/books`, `PUT /api/books/:id`, `DELETE /api/books/:id`
  - Borrowers: `POST /api/borrowers`, `PUT /api/borrowers/:id`, `DELETE /api/borrowers/:id`
  - Borrowings: `POST /api/borrowings/checkout`, `POST /api/borrowings/return`
  - Reports: all `/api/reports/*` endpoints

Examples:

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin@12345"
}
```

Register response (example):

```json
{
  "success": true,
  "message": "User registered",
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@12345"
}
```

Login response (example):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

### Books

- `POST /api/books`
- `GET /api/books?limit=10&offset=0`
- `GET /api/books/search?title=&author=&isbn=&limit=10&offset=0`
- `GET /api/books/:id`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`

Required fields on create:

- `title` (string)
- `author` (string)
- `isbn` (string, unique)
- `shelf_location` (string)
- `available_quantity` (number, optional, defaults to 0, must be >= 0)

Notes:

- Requires authentication for create/update/delete.
- Supports pagination via `limit` and `offset`.
- Search supports `title`, `author`, and `isbn` query parameters.

Examples:

```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "available_quantity": 3,
  "shelf_location": "A-12"
}
```

```http
GET /api/books/search?title=clean&limit=10&offset=0
```

### Borrowers

- `POST /api/borrowers`
- `GET /api/borrowers?limit=10&offset=0`
- `GET /api/borrowers/:id`
- `PUT /api/borrowers/:id`
- `DELETE /api/borrowers/:id`

Required fields on create:

- `name` (string)
- `email` (string, unique)

Notes:

- Requires authentication for create/update/delete.
- Supports pagination via `limit` and `offset`.

Examples:

```http
POST /api/borrowers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sara Ali",
  "email": "sara@example.com"
}
```

```http
GET /api/borrowers?limit=10&offset=0
```

### Borrowings

- `POST /api/borrowings/checkout`
- `POST /api/borrowings/return`
- `GET /api/borrowings/borrowers/:id/active`
- `GET /api/borrowings/overdue`

Required fields:

- Checkout: `book_id`, `borrower_id`, `due_date`
- Return: `borrowing_id`

Notes:

- Checkout and return require authentication.
- `due_date` should be a valid ISO 8601 date.

Examples:

```http
POST /api/borrowings/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "book_id": 1,
  "borrower_id": 2,
  "due_date": "2026-02-28T00:00:00.000Z"
}
```

```http
POST /api/borrowings/return
Authorization: Bearer <token>
Content-Type: application/json

{
  "borrowing_id": 5
}
```

### Reports

- `GET /api/reports/borrowings/summary?from=&to=`
- `GET /api/reports/borrowings/export?from=&to=&format=json|csv|xlsx`
- `GET /api/reports/borrowings/overdue-last-month/export?format=csv|xlsx`
- `GET /api/reports/borrowings/last-month/export?format=csv|xlsx`

Notes:

- `from` and `to` are required for summary/export and should be valid ISO 8601 dates.
- Default formats:
  - Period export (`/borrowings/export`): `json`
  - Last-month exports (`/borrowings/overdue-last-month/export`, `/borrowings/last-month/export`): `csv`
- CSV/XLSX responses are returned as downloadable files.
- Rate limit: 10 requests per minute per IP for all `/api/reports` endpoints.
- `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` are provided in `.env.example` for production configuration.
- In this taske-home assignment, rate limits are defined inline in code for clarity and simplicity.

Examples:

```http
GET /api/reports/borrowings/summary?from=2026-01-01T00:00:00.000Z&to=2026-01-31T23:59:59.000Z
Authorization: Bearer <token>
```

```http
GET /api/reports/borrowings/export?from=2026-01-01T00:00:00.000Z&to=2026-01-31T23:59:59.000Z&format=csv
Authorization: Bearer <token>
```

### Pagination

List and search endpoints accept:

- `limit` (default 10, max 50)
- `offset` (default 0)

## Performance Optimizations

- Index on `books.title` and `books.author`
- Index on (`borrower_id`, `returned_at`) for active borrowings
- Index on (`due_date`, `returned_at`) for overdue queries
- Pagination on all list endpoints

## Database Diagram

![Database Diagram](docs/images/db-diagram.png)

### Response Format

All endpoints return a unified JSON shape:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Errors follow:

```json
{
  "success": false,
  "message": "Bad request",
  "errors": []
}
```
