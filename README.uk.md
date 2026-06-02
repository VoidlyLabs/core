# Voidly Core

[English version](./README.md)

Voidly Core - це backend API для Voidly на NestJS.

Він надає адміністративні та клієнтські e-commerce API, автентифікацію, конфігурацію, локальне файлове сховище і Swagger документацію.

## Можливості

- Public API для клієнтів, товарів, категорій, замовлень і конфігурації магазину.
- Admin API для користувачів, товарів, категорій, конфігурації та admin authentication.
- JWT і cookie-based автентифікація для адміністраторів і клієнтів.
- Local file upload і serving через `/uploads`.
- Версіоновані REST API routes. Версія за замовчуванням - `v1`.
- Swagger documentation на `/api`.

## Стек

- TypeScript
- NestJS 11
- MongoDB 7
- Mongoose
- JWT
- bcryptjs
- Swagger
- Jest

## Розгортання

Для production або VPS deployment використовуйте репозиторій `stack`:

```bash
git clone --recurse-submodules https://github.com/VoidlyLabs/stack.git
cd stack
sh deploy.sh init
nano .env
sh deploy.sh up
```

У `stack/.env` backend налаштовується цими значеннями:

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

Stack задає `MONGODB_URI`, storage paths, cookie names, token lifetimes і початкові admin credentials для container. Uploaded files зберігаються у Docker volume `voidly_core_uploads` і віддаються з `/uploads`.

Залишайте `CORE_NODE_ENV=development`, поки тестуєте через direct HTTP. Перемикайте на `production` лише після того, як API доступний через HTTPS за reverse proxy.

Production API URLs за замовчуванням:

```text
http://YOUR_IP:3000
http://YOUR_IP:3000/api
```

Повний guide з Docker setup, HTTPS, оновленнями, logs, memory tuning і volumes знаходиться у `VoidlyLabs/stack`.

## Локальні Вимоги

- Node.js 20+
- npm
- MongoDB

## Локальне Встановлення

```bash
npm install
cp .env.example .env
```

Мінімально заповніть:

```env
MONGODB_URI=mongodb://localhost:27017/voidly
SERVER_JWT_SECRET=<local-secret>
CLIENT_JWT_SECRET=<local-secret>
LOCAL_STORAGE_BASE_URL=http://localhost:3000
INITIAL_USER_USERNAME=admin
INITIAL_USER_PASSWORD=change-this-password
```

## Локальна Розробка

```bash
npm run start:dev
```

За замовчуванням server працює на:

```text
http://localhost:3000
```

Swagger доступний на:

```text
http://localhost:3000/api
```

## Scripts

```bash
npm run start:dev    # start у development mode
npm run build        # build проєкту
npm run start:prod   # запуск зібраного application
npm run lint         # ESLint з auto-fix
npm run format       # форматування Prettier
npm run test         # unit tests
npm run test:e2e     # e2e tests
npm run test:cov     # test coverage
```

## Структура

```text
src/admin      admin modules
src/common     public і customer-facing modules
src/services   infrastructure services
src/libs       shared utilities
src/decorators decorators
storage        local file storage для development
```
