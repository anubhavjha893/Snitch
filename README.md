# SNITCH.

**Wear Your Own Rules.**

SNITCH is a full-stack e-commerce web app for a streetwear/shirt brand — built as a MERN-stack project with a React (Vite) frontend and a Node.js/Express + MongoDB backend. It covers the full shopping flow: product catalog, cart, checkout with Razorpay, and a seller dashboard for uploading and managing products.

**Live:**
- Frontend: https://snitch-frontend-seven.vercel.app
- Backend API: https://snitch-backend-vy6n.onrender.com

---

## Features

### For shoppers (buyers)
- **Browse the catalog** — product grid with search, category filters (Oversized / Printed / Regular fit) and sorting (featured, latest, price low↔high)
- **Product details** — variant selection (size/color via product attributes), stock-aware add-to-cart
- **Cart** — add/remove items, increment/decrement quantity per variant, live price totals
- **Checkout & payments** — Razorpay integration for order creation, payment verification, and an order receipt page after a successful purchase
- **Authentication** — email/password signup & login, plus **Google OAuth login**
- **Account page** — view and update profile details
- **Light/dark theme toggle** — persisted per-browser via `localStorage`, with a full dark-mode color system

- **Wishlist** — save shirts with the heart button; synced to your account
- **Reviews & ratings** — 1–5 stars with comments, "Verified buyer" badge, average rating on cards
- **Addresses & checkout** — saved address book, coupon codes, shipping fee (free over ₹1,999), Razorpay payment
- **Order tracking** — Placed → Shipped → Delivered timeline, cancel before shipping (auto-refund), return requests within 14 days
- **Guest cart** — add to cart without an account; it merges into your account on sign-in
- **Password reset** — emailed reset link (30 minute expiry)
- **Discovery** — search suggestions, price filter, load more, recently viewed, related products, size guide, share
- **Order emails** — confirmation and status updates (printed to the console when SMTP is not configured)

### For sellers
- **Orders received** — see customers and delivery addresses, mark orders shipped/delivered, approve or reject returns
- **Analytics** — revenue, orders, units, 14-day chart, top products, low-stock alerts
- **Coupons** — create percent/flat coupons with minimum order, cap, usage limit and expiry
- **Edit / delete listings** from the dashboard
- **Role-based access** — users can be `buyer` or `seller`; seller-only routes are protected on both the frontend (route guards) and backend (middleware)
- **Seller dashboard** — list of the seller's own products
- **Create product** — multi-image upload (up to 7 images, 5MB each) via ImageKit, with title, description, price, and variants
- **Manage variants** — add new variants to an existing product, update per-variant stock
- **Product detail (seller view)** — inspect a single product's full data, including all variants and stock levels

### Platform / engineering features
- **JWT-based auth** via httpOnly cookies (`sameSite: lax`, `secure` in production)
- **Route protection** on the frontend (`<Protected>` wrapper, optionally requiring a specific `role`) and the backend (`authenticateUser` / `authenticateSeller` middleware)
- **Input validation** on every write endpoint using `express-validator`
- **Image storage** via ImageKit (product images are uploaded from memory, not stored on disk)
- **Payments** via Razorpay (order creation + signature verification)
- **Catalog seeding** — a starter set of demo products auto-seeds into MongoDB when running in development
- **CORS configured for split deployments** — the deployed frontend proxies all `/api/*` calls to the backend via a Vercel rewrite, so cookies stay same-origin and no cross-site CORS dance is needed

---

## Tech stack

**Frontend** (`Frontend/`)
- React 19 + Vite
- React Router (`react-router`)
- Redux Toolkit + React-Redux (auth, cart, product state)
- Axios (API calls)
- Tailwind CSS 4
- `react-razorpay` (checkout widget)
- `socket.io-client` (wired for real-time features)

**Backend** (`Backend/`)
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) + `bcryptjs` for auth
- Passport.js (`passport-google-oauth20`) for Google login
- `express-validator` for request validation
- Multer (in-memory) + `@imagekit/nodejs` for image uploads
- Razorpay SDK for payments
- Morgan (request logging), CORS, cookie-parser

**Infrastructure**
- MongoDB Atlas (database)
- Render (backend hosting, free web service)
- Vercel (frontend hosting, with an API rewrite to the backend)

---

## Project structure

```
Snitch/
├── Backend/
│   ├── server.js                 # entrypoint — connects DB, starts Express
│   ├── src/
│   │   ├── app.js                # Express app, CORS, route mounting
│   │   ├── config/                # env var loading & validation
│   │   ├── controllers/           # auth, product, cart controllers
│   │   ├── middlewares/           # authenticateUser / authenticateSeller
│   │   ├── models/                # user, product, cart, payment (Mongoose)
│   │   ├── routes/                # /api/auth, /api/products, /api/cart
│   │   ├── validator/             # express-validator schemas
│   │   └── seedCatalog.js         # dev-only demo catalog seeder
│   └── .env.example
│
└── Frontend/
    ├── src/
    │   ├── app/                   # router, layout, global App.css (theming)
    │   └── features/
    │       ├── auth/              # login, register, account, useAuth hook
    │       ├── cart/              # cart page, order receipt, useCart hook
    │       ├── products/          # home, product detail, seller dashboard/CRUD
    │       └── Shared/Components/ # Nav, ThemeToggle
    └── vercel.json                # /api/* rewrite → Render backend
```

---

## API overview

All routes are prefixed with `/api`.

**Auth** (`/api/auth`)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create a buyer or seller account |
| POST | `/login` | Public | Email/password login, sets JWT cookie |
| POST | `/logout` | Public | Clears the auth cookie |
| GET | `/google` | Public | Start Google OAuth flow |
| GET | `/google/callback` | Public | OAuth callback, logs the user in |
| GET | `/me` | Private | Get the current authenticated user |
| PATCH | `/profile` | Private | Update profile details |

**Products** (`/api/products`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List all products |
| GET | `/detail/:id` | Public | Get a single product's details |
| POST | `/` | Seller | Create a product (with image upload) |
| GET | `/seller` | Seller | List the seller's own products |
| POST | `/:productId/variants` | Seller | Add a variant to a product |
| PATCH | `/:productId/variants/:variantId/stock` | Seller | Update a variant's stock |

**Cart** (`/api/cart`)
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Private | Get the current user's cart |
| POST | `/add/:productId/:variantId` | Private | Add an item to the cart |
| PATCH | `/quantity/increment/:productId/:variantId` | Private | +1 quantity |
| PATCH | `/quantity/decrement/:productId/:variantId` | Private | -1 quantity |
| DELETE | `/remove/:productId/:variantId` | Private | Remove an item |
| POST | `/payment/create/order` | Private | Create a Razorpay order |
| POST | `/payment/verify/order` | Private | Verify Razorpay payment signature |
| GET | `/payment/order/:orderId` | Private | Get an order's details |

---

## Running locally

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or Atlas)
- A Google OAuth client ID/secret, ImageKit private key, and Razorpay test keys (optional if you just want to browse the catalog without those features)

### Backend
```bash
cd Backend
npm install
cp .env.example .env   # then fill in the values
npm run dev             # nodemon, http://localhost:3000
```

### Frontend
```bash
cd Frontend
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:3000` (see `Frontend/vite.config.js`), so the frontend and backend talk to each other automatically in development.

### Tests
```bash
cd Backend && npm test
```

### Environment variables (Backend `.env`)
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/snitch
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
NODE_ENV=development
FRONTEND_URL=https://your-frontend.vercel.app   # used for CORS in production
# Optional email settings (password reset + order emails). Leave SMTP_HOST empty to log emails instead.
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=SNITCH. <no-reply@yourdomain.com>
```

---

## Deployment

The app is deployed as two separate services:
- **Backend** on Render, auto-deploying from `main`
- **Frontend** on Vercel, auto-deploying from `main`, with a `vercel.json` rewrite that proxies `/api/*` requests to the Render backend — this keeps auth cookies same-origin without needing cross-site CORS

Every push to `main` redeploys both automatically.
