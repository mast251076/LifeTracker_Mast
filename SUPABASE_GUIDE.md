# Supabase Integration Guide: LifeTracker Intelligence

This guide details the process of migrating the **LifeTracker Intelligence** data layer from local storage to a professional-grade PostgreSQL database hosted on **Supabase**.

---

## 1. Database Setup (Supabase Console)

### Step 1: Create Project
- Sign in to [supabase.com](https://supabase.com).
- Click **New Project**.
- **Region**: Select a region close to your users (e.g., `Mumbai`).
- **Pricing**: Select the **Free Tier**.

### Step 2: Initialize Schema
- Go to the **SQL Editor** in the left menu.
- Click **New Query**.
- Open the `supabase_schema.sql` file provided in this repository.
- Copy the entire content and paste it into the editor.
- Click **Run**.
- *Verification*: You should see tables like `profiles`, `assets`, and `liabilities` appearing in the **Table Editor**.

---

## 2. Application Configuration

### Step 1: Environment Variables
Create or update your `.env.local` file with the keys found in **Project Settings > API**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-encrypted-key
```

### Step 2: The Supabase Client
The application uses the `@supabase/supabase-js` library. The client is initialized in `src/lib/supabase.ts`.

---

## 3. Data Architecture details

### Row Level Security (RLS)
The database is secured by default. Each user can only access their own records based on their `auth.uid()`.
- **Policy**: `profile_id = auth.uid()`
- **Benefit**: Multi-tenancy is handled at the database level, ensuring privacy for every user.

### JSONB for Flexibility
Asset details (like car engine numbers vs. house addresses) are stored in a `details` **JSONB** column. This allows the app to evolve without complex database migrations.

### Automatic Sync Triggers
I have implemented PostgreSQL triggers that automatically update the `last_updated` column whenever a record is modified, ensuring your dashboard metrics are always chronologically accurate.

---

## 4. Migration from LocalStorage
The next phase involves updating `src/lib/storage.ts` to use asynchronous calls to Supabase. The existing `StorageService` can be extended to handle local caching for offline use while syncing with the cloud in the background.

---
*Documented by Antigravity AI Engine*
