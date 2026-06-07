-- Nivas OS Supabase setup
-- Run this in Supabase Dashboard > SQL Editor.
-- It creates public read access for marketplace data and keeps user-owned workflow tables protected by RLS.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'broker', 'builder', 'admin')),
  company_name text,
  city text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.properties (
  id text primary key,
  owner_id uuid references auth.users(id) on delete set null,
  listing_kind text not null default 'property' check (listing_kind in ('property', 'land')),
  land_type text check (land_type in ('agricultural', 'residential', 'commercial', 'industrial')),
  status text not null default 'published' check (status in ('draft', 'pending_verification', 'published', 'rejected', 'archived')),
  title text not null,
  city text not null,
  area text not null,
  locality text not null,
  hierarchy text not null,
  type text not null,
  price text not null,
  budget numeric,
  size text,
  bedrooms int,
  possession text,
  verification text,
  owner_type text,
  score int,
  trust int,
  builder int,
  area_score int,
  investment int,
  risk int,
  yield text,
  growth text,
  commute text,
  amenities text,
  image text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz default now()
);

alter table public.properties add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.properties add column if not exists listing_kind text not null default 'property';
alter table public.properties add column if not exists land_type text;
alter table public.properties add column if not exists status text not null default 'published';

create table if not exists public.localities (
  id text primary key,
  city text not null,
  area text not null,
  name text not null,
  safety_score int,
  traffic_score int,
  pollution_score int,
  livability_score int,
  family_score int,
  rental_demand_score int,
  investment_score int,
  future_growth_score int,
  sentiment text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  property_id text references public.properties(id) on delete cascade,
  visitor_id uuid,
  scheduled_at timestamptz,
  status text default 'requested',
  feedback text,
  created_at timestamptz default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  property_id text references public.properties(id) on delete cascade,
  buyer_id uuid,
  seller_id uuid,
  offer_amount numeric,
  status text default 'draft',
  timeline jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  property_id text references public.properties(id) on delete cascade,
  name text not null,
  verification_status text default 'pending',
  storage_path text,
  created_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id text references public.properties(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete set null,
  owner_id uuid references auth.users(id) on delete set null,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  property_id text references public.properties(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table public.properties enable row level security;
alter table public.localities enable row level security;
alter table public.site_visits enable row level security;
alter table public.deals enable row level security;
alter table public.documents enable row level security;
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Public can read properties" on public.properties;
create policy "Public can read properties"
on public.properties for select
to anon, authenticated
using (status = 'published' or owner_id = auth.uid());

drop policy if exists "Authenticated can create own properties" on public.properties;
create policy "Authenticated can create own properties"
on public.properties for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Owners can update own properties" on public.properties;
create policy "Owners can update own properties"
on public.properties for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Public can read localities" on public.localities;
create policy "Public can read localities"
on public.localities for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated can read own visits" on public.site_visits;
create policy "Authenticated can read own visits"
on public.site_visits for select
to authenticated
using (visitor_id = auth.uid());

drop policy if exists "Authenticated can create visits" on public.site_visits;
create policy "Authenticated can create visits"
on public.site_visits for insert
to authenticated
with check (visitor_id = auth.uid());

drop policy if exists "Users can read related leads" on public.leads;
create policy "Users can read related leads"
on public.leads for select
to authenticated
using (buyer_id = auth.uid() or owner_id = auth.uid());

drop policy if exists "Authenticated can create leads" on public.leads;
create policy "Authenticated can create leads"
on public.leads for insert
to authenticated
with check (buyer_id = auth.uid());

drop policy if exists "Authenticated can read own deals" on public.deals;
create policy "Authenticated can read own deals"
on public.deals for select
to authenticated
using (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "Authenticated can create own deals" on public.deals;
create policy "Authenticated can create own deals"
on public.deals for insert
to authenticated
with check (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "Authenticated can read property documents" on public.documents;
create policy "Authenticated can read property documents"
on public.documents for select
to authenticated
using (true);

drop policy if exists "Users can read own messages" on public.chat_messages;
create policy "Users can read own messages"
on public.chat_messages for select
to authenticated
using (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists "Users can send messages" on public.chat_messages;
create policy "Users can send messages"
on public.chat_messages for insert
to authenticated
with check (sender_id = auth.uid());

insert into storage.buckets (id, name, public)
values
  ('property-images', 'property-images', true),
  ('property-documents', 'property-documents', false)
on conflict (id) do nothing;

drop policy if exists "Public can read property images" on storage.objects;
create policy "Public can read property images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'property-images');

drop policy if exists "Authenticated can upload property images" on storage.objects;
create policy "Authenticated can upload property images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'property-images');

drop policy if exists "Authenticated can read property documents" on storage.objects;
create policy "Authenticated can read property documents"
on storage.objects for select
to authenticated
using (bucket_id = 'property-documents');

drop policy if exists "Authenticated can upload property documents" on storage.objects;
create policy "Authenticated can upload property documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'property-documents');

insert into public.properties (
  id, listing_kind, status, title, city, area, locality, hierarchy, type, price, budget, size, bedrooms, possession,
  verification, owner_type, score, trust, builder, area_score, investment, risk, yield, growth,
  commute, amenities, image, lat, lng
) values
  (
    'aster-park',
    'property',
    'published',
    'Aster Park Residences',
    'Bengaluru',
    'Whitefield',
    'Kadugodi',
    'India / Karnataka / Bengaluru / East / Whitefield / Kadugodi / Aster Park / Tower B / B-1804',
    '3 BHK Apartment',
    'INR 1.18 Cr',
    118,
    '1,620 sq ft',
    3,
    'Ready to move',
    'Property Verified',
    'Owner',
    92,
    96,
    94,
    88,
    82,
    18,
    '3.8%',
    'High',
    '18 min to metro',
    'Clubhouse, pool, coworking lounge, EV parking',
    'linear-gradient(135deg, #ccbfae, #7f9788 46%, #2b3740)',
    12.9698,
    77.7499
  ),
  (
    'indigo-grove',
    'property',
    'published',
    'Indigo Grove Villas',
    'Bengaluru',
    'Sarjapur Road',
    'Dommasandra',
    'India / Karnataka / Bengaluru / South East / Sarjapur Road / Dommasandra / Indigo Grove / Villa Row / V-12',
    '4 BHK Villa',
    'INR 2.42 Cr',
    242,
    '3,480 sq ft',
    4,
    'Under construction',
    'Builder Verified',
    'Builder',
    87,
    93,
    91,
    82,
    89,
    26,
    '4.2%',
    'Very high',
    '32 min to ORR',
    'Private garden, solar backup, club, sports courts',
    'linear-gradient(135deg, #d8cab3, #4f8a72 42%, #46384f)',
    12.8788,
    77.7854
  ),
  (
    'metro-nest',
    'property',
    'published',
    'Metro Nest',
    'Mumbai',
    'Thane West',
    'Majiwada',
    'India / Maharashtra / Mumbai / Thane Belt / Thane West / Majiwada / Metro Nest / Tower A / A-1207',
    '2 BHK Rental',
    'INR 54k/mo',
    54,
    '910 sq ft',
    2,
    'Available now',
    'Owner Verified',
    'Owner',
    89,
    98,
    88,
    90,
    76,
    12,
    'NA',
    'Medium',
    '9 min to metro',
    'Gym, security, play area, visitor parking',
    'linear-gradient(135deg, #c7d7dc, #e1b79d 45%, #202020)',
    19.2183,
    72.9781
  ),
  (
    'capital-heights',
    'property',
    'published',
    'Capital Heights',
    'Gurugram',
    'Dwarka Expressway',
    'Sector 113',
    'India / Delhi NCR / Gurugram / Dwarka Expressway / Sector 113 / Capital Heights / Tower C / C-2401',
    '3.5 BHK Apartment',
    'INR 1.74 Cr',
    174,
    '2,050 sq ft',
    3,
    'Under construction',
    'Legal Verified',
    'Developer',
    86,
    90,
    85,
    84,
    91,
    31,
    '3.5%',
    'Very high',
    '24 min to Cyber City',
    'Club, pool, concierge, business lounge',
    'linear-gradient(135deg, #d7d1c1, #8c9278 40%, #334155)',
    28.5226,
    77.0229
  ),
  (
    'vrindavan-plot-yamuna',
    'land',
    'published',
    'Vrindavan Yamuna Corridor Plot',
    'Vrindavan',
    'Chhatikara Road',
    'Sunrakh Bangar',
    'India / Uttar Pradesh / Vrindavan / Chhatikara Road / Sunrakh Bangar / Residential Plot',
    'Residential Plot',
    'Indicative INR 38 Lakh',
    38,
    '1,350 sq ft',
    0,
    'Immediate',
    'Area Data Verified',
    'Dealer',
    74,
    62,
    0,
    72,
    78,
    44,
    'NA',
    'High pilgrimage demand',
    'Near Chhatikara Road',
    'Road access, temple corridor demand, boundary verification needed',
    'linear-gradient(135deg, #f3ead8, #8ba888 46%, #415a4c)',
    27.5758,
    77.6558
  ),
  (
    'mathura-pg-dampier',
    'property',
    'published',
    'Mathura Dampier Nagar PG',
    'Mathura',
    'Dampier Nagar',
    'Junction Road',
    'India / Uttar Pradesh / Mathura / Dampier Nagar / Junction Road / PG Inventory',
    'PG / Co-living',
    'Indicative INR 8k/mo',
    8,
    'Single and double sharing',
    0,
    'Available now',
    'Area Data Verified',
    'Operator',
    71,
    58,
    0,
    76,
    64,
    36,
    'Rental income',
    'Stable student and worker demand',
    'Near station and market',
    'Food, wifi, security, operator verification needed',
    'linear-gradient(135deg, #e8eff2, #b8a27d 45%, #314256)',
    27.4924,
    77.6737
  ),
  (
    'bharatpur-ranjeet-nagar-flat',
    'property',
    'published',
    'Bharatpur Ranjeet Nagar Flat',
    'Bharatpur',
    'Ranjeet Nagar',
    'Near Saras Circle',
    'India / Rajasthan / Bharatpur / Ranjeet Nagar / Saras Circle / Flat Inventory',
    '2 BHK Flat',
    'Indicative INR 32 Lakh',
    32,
    '980 sq ft',
    2,
    'Ready to move',
    'Area Data Verified',
    'Owner',
    73,
    61,
    0,
    74,
    66,
    34,
    'To be verified',
    'Medium',
    'City-center access',
    'Parking, market access, document verification needed',
    'linear-gradient(135deg, #ece2cf, #7e9aa1 44%, #354250)',
    27.2173,
    77.4895
  ),
  (
    'bharatpur-nadbai-road-land',
    'land',
    'published',
    'Bharatpur Nadbai Road Land',
    'Bharatpur',
    'Nadbai Road',
    'Outer growth belt',
    'India / Rajasthan / Bharatpur / Nadbai Road / Outer Growth Belt / Agricultural Land',
    'Agricultural Land',
    'Indicative price on request',
    0,
    'Approx 1 bigha',
    0,
    'To be verified',
    'Area Data Verified',
    'Dealer',
    68,
    54,
    0,
    70,
    72,
    48,
    'NA',
    'Outer road growth potential',
    'Road access to Bharatpur',
    'Road access, khasra and ownership verification required',
    'linear-gradient(135deg, #efe4ca, #8d9b62 45%, #334033)',
    27.2564,
    77.4529
  )
on conflict (id) do update set
  listing_kind = excluded.listing_kind,
  status = excluded.status,
  title = excluded.title,
  city = excluded.city,
  area = excluded.area,
  locality = excluded.locality,
  hierarchy = excluded.hierarchy,
  type = excluded.type,
  price = excluded.price,
  budget = excluded.budget,
  size = excluded.size,
  bedrooms = excluded.bedrooms,
  possession = excluded.possession,
  verification = excluded.verification,
  owner_type = excluded.owner_type,
  score = excluded.score,
  trust = excluded.trust,
  builder = excluded.builder,
  area_score = excluded.area_score,
  investment = excluded.investment,
  risk = excluded.risk,
  yield = excluded.yield,
  growth = excluded.growth,
  commute = excluded.commute,
  amenities = excluded.amenities,
  image = excluded.image,
  lat = excluded.lat,
  lng = excluded.lng;

insert into public.localities (
  id, city, area, name, safety_score, traffic_score, pollution_score, livability_score,
  family_score, rental_demand_score, investment_score, future_growth_score, sentiment, lat, lng
) values
  ('whitefield', 'Bengaluru', 'Whitefield', 'Whitefield', 92, 68, 74, 91, 89, 86, 84, 88, 'Positive for schools, commute, and daily convenience', 12.9698, 77.7499)
on conflict (id) do update set
  city = excluded.city,
  area = excluded.area,
  name = excluded.name,
  safety_score = excluded.safety_score,
  traffic_score = excluded.traffic_score,
  pollution_score = excluded.pollution_score,
  livability_score = excluded.livability_score,
  family_score = excluded.family_score,
  rental_demand_score = excluded.rental_demand_score,
  investment_score = excluded.investment_score,
  future_growth_score = excluded.future_growth_score,
  sentiment = excluded.sentiment,
  lat = excluded.lat,
  lng = excluded.lng;
