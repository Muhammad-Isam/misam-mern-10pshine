# Notes Web App

## Tech Stack

### Frontend
- Frontend
- Technologies: React, Vite (build tool), Babel (transpiler)
- UI Toolkit: React Bootstrap
- Date Handling: date-fns
- Rich Text Editor: React Quill
- Routing: React Router DOM
- Icons: React Icons
- Testing: Jest, React Testing Library

### Backend
- Technologies: Node.js, Express
- Database: MongoDB
- Authentication: JSON Web Tokens (JWT)
- Environment Variables: dotenv
- Logger: Pino (with Pino Pretty for development logs)
- Emailing: Nodemailer
- Testing: Jest, Supertest
- In-Memory Database for Testing: mongodb-memory-server

## Third-Party Services
- Sonar for code analysis

## Environment Variables
- MONGO_URI (Database connection)
- GMAIL_USER (Gmail Email)
- GMAIL_APP_PASSWORD (Gmail App Password)
- JWT_SECRET (JWT secret token)
- MONGODB_TEST_URI (Test MongoDB set URI)

## Running the Project

### Backend

1. Navigate to the backend directory:
cd backend

2. Install dependencies:
npm install

3. Start the backend server:
node server.js

### Frontend

1. Navigate to the frontend directory:
cd frontend

2. Install dependencies:
npm install
Copy
3. Start the frontend development server:
npm run dev
## Running Tests
cd backend
npx jest
### Backend Tests
cd frontend
npx jest



- Search implementation on both Content and Title of the Note
- OTP for Password Reset (1 minute expiration timer and 1 try valid only)
- Change Password via Modal Box from Header
- Move Note Functionality from existing categories, otherwise create a new category and move
- Mark the Note as favorite

