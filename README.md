# Gupta Agencies — B2B Distributor Ordering Platform

A full-stack B2B ordering platform for **Gupta Agencies**, enabling retailers to browse product catalogs, place orders, and track deliveries — while salesmen and admins manage operations from role-specific dashboards.

---

## 🧩 Tech Stack

| Layer       | Technology                                              |
| ----------- | ------------------------------------------------------- |
| Framework   | [Next.js 16](https://nextjs.org/) (App Router)          |
| UI          | [React 19](https://react.dev/), TypeScript              |
| Styling     | [Tailwind CSS v4](https://tailwindcss.com/)             |
| Icons       | [Lucide React](https://lucide.dev/)                     |
| Backend     | [Supabase](https://supabase.com/) (Auth + PostgreSQL)   |
| Auth        | Supabase Auth (email/password)                          |
| Deployment  | [Vercel](https://vercel.com/)                           |

---

## 📁 Project Structure

```
gupta_agencies/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Login page
│   │   │   ├── admin/              # Super Admin dashboard & management
│   │   │   ├── retailer/           # Retailer catalog, cart & orders
│   │   │   ├── salesman/           # Salesman dashboard & order management
│   │   │   └── api/                # API routes (server-side)
│   │   ├── components/             # Shared UI components
│   │   ├── lib/                    # Supabase clients, auth context, utilities
│   │   └── middleware.ts           # Auth & role-based route protection
│   ├── public/                     # Static assets
│   ├── .env.local                  # Environment variables (local)
│   ├── next.config.ts              # Next.js configuration
│   ├── tailwind.config.*           # Tailwind configuration
│   └── package.json
├── supabase/                 # Database setup files
│   ├── schema.sql                  # Tables, indexes, functions
│   ├── rls-policies.sql            # Row-Level Security policies
│   ├── storage-policies.sql        # Storage bucket policies
│   ├── seed.sql                    # Default brands seed data
│   ├── seed-drfixit-products.sql   # Dr. Fixit product catalog seed
│   └── seed-araldite-products.sql  # Araldite product catalog seed
└── deployment-guide.md       # Production deployment guide
```

---

## 👥 User Roles

| Role            | Access                                                        |
| --------------- | ------------------------------------------------------------- |
| **Super Admin** | Full control — manage users, brands, products, orders         |
| **Salesman**    | View assigned retailers, manage orders, dashboard analytics   |
| **Retailer**    | Browse catalog, add to cart, place orders, track order status  |

---

## 🚀 Local Setup

### Prerequisites

- **Node.js** `18+` — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **Supabase** account — [Sign up free](https://supabase.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gupta_agencies.git
cd gupta_agencies
```

---

### 2. Set Up Supabase

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a **New Project**.
2. Once created, go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep secret!)

#### Run Database Migrations

Open the **SQL Editor** in Supabase Dashboard and execute these files **in order**:

```
1. supabase/schema.sql           → Tables, indexes, triggers, functions
2. supabase/rls-policies.sql     → Row-Level Security policies
3. supabase/storage-policies.sql → Storage bucket policies
4. supabase/seed.sql             → Default brand data
```

**Optional — Seed Product Catalogs:**

```
5. supabase/seed-drfixit-products.sql    → Dr. Fixit products & SKUs
6. supabase/seed-araldite-products.sql   → Araldite products & SKUs
```

#### Create the Super Admin User

1. In Supabase Dashboard, go to **Authentication → Users → Add User**
2. Create a user with your admin email and a strong password
3. Copy the user's **UUID**
4. Run in SQL Editor:

```sql
INSERT INTO public.users (id, email, role, owner_name, is_active)
VALUES ('<YOUR_UUID>', '<YOUR_EMAIL>', 'super_admin', 'Admin', true);
```

---

### 3. Configure Environment Variables

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

> ⚠️ **Never commit `.env.local` to version control.** It is already included in `.gitignore`.

---

### 4. Install Dependencies

```bash
cd frontend
npm install
```

---

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the login page.

---

## 📜 Available Scripts

Run these from the `frontend/` directory:

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start development server             |
| `npm run build`  | Create production build               |
| `npm run start`  | Start production server               |
| `npm run lint`   | Run ESLint                             |

---

## 🗄️ Database Schema Overview

```
brands (1) ──→ (N) products (1) ──→ (N) skus
                                            │
users ──→ orders (1) ──→ (N) order_items ──┘
```

| Table          | Purpose                                              |
| -------------- | ---------------------------------------------------- |
| `users`        | All users with roles (`super_admin`, `salesman`, `retailer`) |
| `brands`       | Product brands (e.g., Dr. Fixit, Araldite)            |
| `products`     | Product groups under a brand                          |
| `skus`         | Individual variants with pricing (MRP, dealer price)  |
| `orders`       | Order header (status, total, retailer, salesman)      |
| `order_items`  | Line items linking SKUs to orders                     |

All tables have **Row-Level Security (RLS)** enabled to enforce role-based access at the database level.

---

## 🔒 Security

- **Row-Level Security** — Enforced on all tables via Supabase RLS policies
- **Role-based middleware** — Next.js middleware protects routes based on user role
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` set in `next.config.ts`
- **Service role key** — Only used server-side, never exposed to the browser

---

## 🌐 Deployment

For production deployment to Vercel + Supabase, see the full [Deployment Guide](./deployment-guide.md).

**Quick summary:**

```bash
cd frontend
npm run build          # verify build locally
npx vercel --prod      # deploy to Vercel
```

Set the same three environment variables in your Vercel project settings.

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📄 License

This project is proprietary software for **Gupta Agencies**. All rights reserved.
