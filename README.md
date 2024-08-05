# Polling System Backend

This is the backend for a real-time polling application built with Node.js, Express, and Prisma.

## Features

1. **User Authentication**: JWT-based authentication system.
2. **Poll Management**: Create, read, update, and delete polls.
3. **Real-time Updates**: Socket.io integration for live poll results.
4. **Database Integration**: PostgreSQL database with Prisma ORM.
5. **Input Validation**: Request validation using Zod.
6. **API Security**: Implementation of helmet for enhanced API security.

## Technology Stack

- Node.js
- Express.js
- TypeScript
- Prisma (ORM)
- PostgreSQL
- Socket.io
- JSON Web Tokens (JWT)
- Zod (for validation)
- SWC (for fast TypeScript compilation)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/polling-backend.git
   cd polling-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your database URL and other required variables

4. Set up the database:
   ```
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. Start the development server:
   ```
   npm run dev
   ```

The server should now be running on `http://localhost:3000` (or your specified port).

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot-reloading
- `npm run build`: Build the project for production using SWC
- `npm run build:tsc`: Build the project using TypeScript compiler (alternative)
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Run ESLint and fix issues
- `npm run prisma:init`: Initialize Prisma in the project
- `npm run prisma:migrate`: Run database migrations
- `npm run prisma:generate`: Generate Prisma client
- `npm run prettier:format`: Format code using Prettier

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middlewares/    # Express middlewares
├── models/         # Data models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── prisma/         # Prisma schema and migrations
└── server.ts       # Entry point
```


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.