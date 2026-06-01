# Voidly Core

Backend API for Voidly, built with NestJS, TypeScript, and MongoDB.

## Features

- public API for clients, products, categories, and configuration;
- admin API for users, products, categories, and configuration;
- JWT and cookie-based authentication;
- local file upload and serving;
- Swagger documentation.

## Requirements

- Node.js
- npm
- MongoDB

## Installation

```bash
npm install
```

Create `.env` from the example file:

```bash
cp .env.example .env
```

At minimum, fill in:

```env
MONGODB_URI=
SERVER_JWT_SECRET=
CLIENT_JWT_SECRET=
```

## Running

```bash
npm run start:dev
```

By default, the server runs at `http://localhost:3000`.

Swagger is available at:

```text
http://localhost:3000/api
```

The API uses URI versioning. The default version is `v1`.

## Scripts

```bash
npm run start:dev    # start in development mode
npm run build        # build the project
npm run start:prod   # run the built application
npm run lint         # run ESLint with auto-fix
npm run format       # format with Prettier
npm run test         # run unit tests
npm run test:e2e     # run e2e tests
npm run test:cov     # run test coverage
```

## Structure

```text
src/admin      admin modules
src/common     public modules
src/services   infrastructure services
src/libs       shared utilities
src/decorators decorators
storage        local file storage
```

## Environment

Available environment variables are listed in `.env.example`.
