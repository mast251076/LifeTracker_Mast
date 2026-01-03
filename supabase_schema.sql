-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  currency_preference text default 'INR',
  theme_preference text default 'dark',
  is_setup_complete boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Assets Table
create table if not exists assets (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  type text not null,
  description text,
  ownership text,
  status text default 'ACTIVE',
  current_value_amount numeric,
  current_value_currency text default 'INR',
  purchase_value_amount numeric,
  purchase_value_currency text default 'INR',
  purchase_date date,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  tags text[],
  notes text,
  details jsonb default '{}'::jsonb
);

-- 3. Liabilities Table
create table if not exists liabilities (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  type text not null,
  status text default 'ACTIVE',
  outstanding_amount_amount numeric,
  outstanding_amount_currency text default 'INR',
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  tags text[],
  notes text,
  details jsonb default '{}'::jsonb
);

-- 4. Income Sources Table
create table if not exists income_sources (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  type text not null,
  amount_amount numeric,
  amount_currency text default 'INR',
  frequency text,
  is_taxable boolean default true,
  notes text,
  details jsonb default '{}'::jsonb
);

-- 5. Expenses Table
create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  amount_amount numeric,
  amount_currency text default 'INR',
  date date not null,
  category text,
  sub_category text,
  merchant text,
  payment_instrument_id uuid,
  description text,
  is_recurring boolean default false,
  tags text[]
);

-- 6. Payment Instruments Table
create table if not exists payment_instruments (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  type text not null,
  balance_amount numeric default 0,
  balance_currency text default 'INR',
  status text default 'ACTIVE'
);

-- 7. Documents Table
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  category text,
  document_number text,
  issue_date date,
  expiry_date date,
  issuer text,
  notes text,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Vault Entries Table
create table if not exists vault_entries (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  category text,
  username text,
  password text,
  secret_note text,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Life Events Table
create table if not exists life_events (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  date date not null
);

-- Trigger function to update last_updated
create or replace function update_last_updated_column()
returns trigger as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers
create trigger update_assets_last_updated before update on assets for each row execute procedure update_last_updated_column();
create trigger update_liabilities_last_updated before update on liabilities for each row execute procedure update_last_updated_column();
create trigger update_documents_last_updated before update on documents for each row execute procedure update_last_updated_column();
create trigger update_vault_entries_last_updated before update on vault_entries for each row execute procedure update_last_updated_column();

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table assets enable row level security;
alter table liabilities enable row level security;
alter table income_sources enable row level security;
alter table expenses enable row level security;
alter table payment_instruments enable row level security;
alter table documents enable row level security;
alter table vault_entries enable row level security;
alter table life_events enable row level security;

-- Create Policies
-- Profiles: Users can only see and update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Assets: Users can only see and manage their own assets
create policy "Users can view own assets" on assets for select using (profile_id = auth.uid());
create policy "Users can insert own assets" on assets for insert with check (profile_id = auth.uid());
create policy "Users can update own assets" on assets for update using (profile_id = auth.uid());
create policy "Users can delete own assets" on assets for delete using (profile_id = auth.uid());

-- Repeat for other tables...
create policy "Users can view own liabilities" on liabilities for select using (profile_id = auth.uid());
create policy "Users can insert own liabilities" on liabilities for insert with check (profile_id = auth.uid());
create policy "Users can update own liabilities" on liabilities for update using (profile_id = auth.uid());
create policy "Users can delete own liabilities" on liabilities for delete using (profile_id = auth.uid());

create policy "Users can view own income_sources" on income_sources for select using (profile_id = auth.uid());
create policy "Users can insert own income_sources" on income_sources for insert with check (profile_id = auth.uid());

create policy "Users can view own expenses" on expenses for select using (profile_id = auth.uid());
create policy "Users can insert own expenses" on expenses for insert with check (profile_id = auth.uid());

create policy "Users can view own payment_instruments" on payment_instruments for select using (profile_id = auth.uid());
create policy "Users can insert own payment_instruments" on payment_instruments for insert with check (profile_id = auth.uid());

create policy "Users can view own documents" on documents for select using (profile_id = auth.uid());
create policy "Users can insert own documents" on documents for insert with check (profile_id = auth.uid());

create policy "Users can view own vault_entries" on vault_entries for select using (profile_id = auth.uid());
create policy "Users can insert own vault_entries" on vault_entries for insert with check (profile_id = auth.uid());

create policy "Users can view own life_events" on life_events for select using (profile_id = auth.uid());
create policy "Users can insert own life_events" on life_events for insert with check (profile_id = auth.uid());
