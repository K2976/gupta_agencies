# Gupta Agencies — Deployment Guide

## Prerequisites
- Node.js 18+
- Supabase account ([supabase.com](https://supabase.com))
- Vercel account ([vercel.com](https://vercel.com))

---

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project** → fill in name, password, region
3. Copy `Project URL` and `anon public` key from **Settings → API**
4. Copy `service_role` key (keep this secret!)

### Run Database Schema
1. Open **SQL Editor** in Supabase Dashboard
2. Run files in this order:
   - `supabase/schema.sql` — tables, indexes, functions
   - `supabase/rls-policies.sql` — row-level security
   - `supabase/storage-policies.sql` — storage bucket policies
   - `supabase/seed.sql` — default brands

### Create Super Admin User
1. Go to **Authentication → Users → Add User**
2. Email: `admin@guptaagencies.com`, Password: `Admin@123456`
3. Copy the user's UUID
4. Run in SQL Editor:
```sql
INSERT INTO public.users (id, email, role, owner_name, is_active)
VALUES ('YOUR_UUID_HERE', 'admin@guptaagencies.com', 'super_admin', 'Admin', true);
```

### Configure Auth
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to your domain (e.g., `https://your-app.vercel.app`)
3. Add redirect URLs as needed

---

## 2. Frontend Deployment (Vercel)

### Environment Variables
Set these in Vercel project settings:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

### Deploy
```bash
cd frontend
npm install
npm run build  # verify locally first

# Deploy to Vercel
npx vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## 3. Custom Domain Setup

### Vercel
1. Go to **Project Settings → Domains**
2. Add your domain (e.g., `order.guptaagencies.com`)
3. Update DNS records as shown by Vercel

### Supabase
1. Go to **Authentication → URL Configuration**
2. Update **Site URL** to `https://order.guptaagencies.com`
3. Update **Redirect URLs** to include the new domain

---

## 4. Security Checklist
- [ ] RLS enabled on all tables
- [ ] Service role key only in server-side env vars (never `NEXT_PUBLIC_`)
- [ ] Strong admin password (change from default immediately)
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] Security headers configured in `next.config.ts`

---

## 5. Local Development
```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm install
npm run dev
# Open http://localhost:3000
```
