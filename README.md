# ShopStack Frontend

Next.js App Router frontend for the Express, PostgreSQL, and Prisma e-commerce API.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The backend must be running at `http://localhost:5001`. The frontend runs at `http://localhost:3000`.

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## Routes

- `/` - live storefront homepage with categories and featured products
- `/login` - JWT login
- `/register` - customer registration and automatic login
- `/products` - live Products and secure Order creation
- `/products/[id]` - individual Product details and purchase action
- `/categories` - live Categories
- `/categories/[id]` - products filtered by the selected Category
- `/orders` - authenticated User Orders
- `/admin` - ADMIN dashboard
- `/admin/users` - ADMIN User listing
- `/admin/orders` - ADMIN Order listing and status management
- `/admin/products` - ADMIN Product CRUD
- `/admin/categories` - ADMIN Category CRUD

Authentication is persisted in local storage. Protected API requests automatically receive the Bearer token. A backend `401` clears the local session and redirects to login.

## Verification

```bash
npm run lint
npm run build
```
