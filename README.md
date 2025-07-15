# Expense Tracker API

A Node.js and MongoDB RESTful API for tracking personal and group expenses, incomes, and budgets, with robust analytics and user management.

## Features
- User registration and authentication (JWT)
- Add, update, delete, and list expenses (with split allocation across categories)
- Add, update, delete, and list incomes per user
- Add, update, delete, and list budgets per user (per month, per category)
- Category management per user (update/delete categories)
- Filtering, sorting, and pagination for expenses and incomes
- Monthly summary analytics (automated aggregation of expenses and incomes by category)
- Robust validation and error handling
- Automated monthly summary generation (via cron job)

## Design Decisions
- **Split allocation for better analytics:**
  Each expense can be split across multiple categories, validated against user-defined categories. This enables more accurate tracking and prevents double counting.
- **Monthly summary aggregation:**
  Uses MongoDB aggregation pipelines to generate per-user, per-month summaries for both expenses and incomes.
- **Budgeting per month:**
  Budgets are set per user and per month, with flexible category allocation.
- **Category validation:**
  All expense and budget categories are validated against the user's allowed categories.
- **Automated analytics:**
  A scheduled cron job generates monthly summaries for all users, merging expense and income data for analytics.

## Project Structure
```
app.js
controllers/
models/
routes/
middleware/
db/
error/
services/
aggregationPipelines/
dummy-data/
```
- **services/**: Business logic for expenses, income, and summary generation.
- **aggregationPipelines/**: MongoDB aggregation pipeline definitions for analytics.

## Getting Started

### Prerequisites
- Node.js
- MongoDB (local or Atlas)

### Installation
1. Clone the repository:
   ```sh
   git clone "https://github.com/victor-uk/Expense-Tracker-App.git"
   cd expense-tracker
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory with:
   ```env
   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   PORT=5000
   ```

### Running the Server
```sh
node app.js
```

## API Endpoints

### Auth
- `POST /api/v1/login` — Login and get a JWT
- `POST /api/v1/signup` — Register a new user

### Users
- `GET /api/v1/users` — List all users
- `GET /api/v1/users/:id` — Get a single user
- `PATCH /api/v1/users/:id` — Update a user
- `DELETE /api/v1/users/:id` — Delete a user
- `PATCH /api/v1/users/:id/categories` — Update user categories
- `DELETE /api/v1/users/:id/categories` — Delete user categories

### Expenses
- `GET /api/v1/:user_id/expenses` — List expenses for a user (with filters)
- `POST /api/v1/:user_id/expenses` — Add a new expense
- `GET /api/v1/:user_id/expenses/:id` — Get a single expense
- `PATCH /api/v1/:user_id/expenses/:id` — Update an expense
- `DELETE /api/v1/:user_id/expenses/:id` — Delete an expense

### Income
- `GET /api/v1/:user_id/incomes` — List incomes for a user
- `POST /api/v1/:user_id/incomes` — Add a new income
- `GET /api/v1/:user_id/incomes/:id` — Get a single income
- `PATCH /api/v1/:user_id/incomes/:id` — Update an income
- `DELETE /api/v1/:user_id/incomes/:id` — Delete an income

### Budgets
- `GET /api/v1/:user_id/budgets` — List budgets for a user
- `POST /api/v1/:user_id/budgets` — Add a new budget
- `GET /api/v1/:user_id/budgets/:id` — Get a single budget
- `PATCH /api/v1/:user_id/budgets/:id` — Update a budget
- `DELETE /api/v1/:user_id/budgets/:id` — Delete a budget

### Summary
- `GET /api/v1/:user_id/summary` — Get monthly summary for a user

## Usage
- All protected routes require a valid JWT in the `Authorization` header.

## License
MIT
