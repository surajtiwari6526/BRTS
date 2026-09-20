create table if not exists public.routes (
  id text primary key,
  route_no text not null unique,
  route_name text not null,
  start_point text not null,
  end_point text not null,
  total_stops integer not null,
  intermediate_stops jsonb not null default '[]'::jsonb,
  min_fare_inr numeric(10, 2) not null,
  max_fare_inr numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stops (
  id text primary key,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  route_id text not null,
  tickets_sold_last_hour integer not null default 0,
  waiting_passengers integer not null default 0,
  rush_level text not null default 'LOW_RUSH',
  created_at timestamptz not null default now()
);

create table if not exists public.buses (
  id text primary key,
  bus_number text not null unique,
  route_id text not null,
  route_name text not null,
  current_stop text not null,
  latitude double precision not null,
  longitude double precision not null,
  heading double precision not null default 0,
  speed_kmph double precision not null default 0,
  capacity integer not null,
  current_passengers integer not null default 0,
  plf_percent double precision not null default 0,
  status text not null,
  is_diverted boolean not null default false,
  diverted_to text,
  path_index integer,
  updated_at timestamptz not null default now(),
  constraint buses_route_id_fkey foreign key (route_id) references public.routes (id)
);

create table if not exists public.dispatch_logs (
  id text primary key,
  bus_id text not null,
  bus_number text not null,
  source_route text not null,
  target_route text not null,
  dpr numeric(10, 2) not null,
  benefit_inr numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  constraint dispatch_logs_bus_id_fkey foreign key (bus_id) references public.buses (id)
);

create index if not exists buses_route_id_idx on public.buses (route_id);
create index if not exists buses_updated_at_idx on public.buses (updated_at desc);
create index if not exists dispatch_logs_created_at_idx on public.dispatch_logs (created_at desc);

alter table public.routes enable row level security;
alter table public.stops enable row level security;
alter table public.buses enable row level security;
alter table public.dispatch_logs enable row level security;