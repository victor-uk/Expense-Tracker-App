# Expense Tracker API

A Node.js and MongoDB RESTful API for tracking personal and group expenses.

## Features
- User registration and authentication (JWT)
- Add, update, delete, and list expenses
- Category management per user
- Filtering, sorting, and pagination for expenses
- Robust validation and error handling

## Design Decisions
- **Split allocation for better analytics:**
  Each expense has a split allocation to enables users better track their expenses. It accounts for the fact that users may often make expenses involving different categories. It also prevents double counting


## Project Structure
```
app.js
controllers/
models/
routes/
middleware/
db/
error/
```

## Getting Started

### Prerequisites
- Node.js
- MongoDB (local or Atlas)

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
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
- `POST /api/v1/auth/register` — Register a new user
- `POST /api/v1/auth/login` — Login and get a JWT
- `GET /api/v1/users/:user_id/expenses` — List expenses for a user (with filters)
- `POST /api/v1/users/:user_id/expenses` — Add a new expense
- `PATCH /api/v1/users/:user_id/expenses/:expense_id` — Update an expense
- `DELETE /api/v1/users/:user_id/expenses/:expense_id` — Delete an expense

## Usage
- All protected routes require a valid JWT in the `Authorization` header.

## License
MIT
