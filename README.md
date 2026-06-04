# Voidly Core

[Українська версія](./README.uk.md)

Voidly Core is the NestJS backend API for Voidly.

It provides administrative and customer-facing e-commerce APIs, authentication, configuration, local file storage, and Swagger documentation.

## Features

- Public API for clients, products, categories, orders, and store configuration.
- Admin API for users, products, categories, configuration, and admin authentication.
- JWT and cookie-based authentication for administrators and customers.
- Local file upload and serving through `/uploads`.
- Versioned REST API routes. The default API version is `v1`.
- Swagger documentation at `/api`.

## Stack

- TypeScript
- NestJS 11
- MongoDB 7
- Mongoose
- JWT
- bcryptjs
- Swagger
- Jest

## Deployment

For production or VPS deployment, use the `stack` repository:

```bash
git clone --recurse-submodules https://github.com/VoidlyLabs/stack.git
cd stack
sh deploy.sh init
nano .env
sh deploy.sh up
```

In `stack/.env`, the backend is configured by these values:

```env
PUBLIC_CORE_URL=http://YOUR_IP:3000
CORE_BIND=0.0.0.0
CORE_PORT=3000
CORE_NODE_ENV=development
MONGO_USERNAME=voidly
MONGO_PASSWORD=<generated-or-custom-password>
MONGO_DATABASE=voidly
SERVER_JWT_SECRET=<generated-secret>
CLIENT_JWT_SECRET=<generated-secret>
INITIAL_USER_USERNAME=admin
INITIAL_USER_PASSWORD=<generated-or-custom-password>
```

The stack sets `MONGODB_URI`, storage paths, cookie names, token lifetimes, and initial admin credentials for the container. Uploaded files are stored in the `voidly_core_uploads` Docker volume and served from `/uploads`.

Keep `CORE_NODE_ENV=development` while testing over direct HTTP. Switch to `production` only after serving the API over HTTPS through a reverse proxy.

The default production API URLs are:

```text
http://YOUR_IP:3000
http://YOUR_IP:3000/api
```

See `VoidlyLabs/stack` for the full deployment guide, including Docker setup, HTTPS, updates, logs, memory tuning, and volumes.

## Local Requirements

- Node.js 20+
- npm
- MongoDB

## Local Installation

```bash
npm install
cp .env.example .env
```

At minimum, fill in:

```env
MONGODB_URI=mongodb://localhost:27017/voidly
SERVER_JWT_SECRET=<local-secret>
CLIENT_JWT_SECRET=<local-secret>
LOCAL_STORAGE_BASE_URL=http://localhost:3000
INITIAL_USER_USERNAME=admin
INITIAL_USER_PASSWORD=change-this-password
```

## Local Development

```bash
npm run start:dev
```

By default, the server runs at:

```text
http://localhost:3000
```

Swagger is available at:

```text
http://localhost:3000/api
```

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
src/common     public and customer-facing modules
src/services   infrastructure services
src/libs       shared utilities
src/decorators decorators
storage        local file storage for development
```
