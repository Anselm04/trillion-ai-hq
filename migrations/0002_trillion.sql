create table if not exists profiles (
  user_id text primary key,
  email text,
  display_name text,
  role text not null default 'customer',
  department text,
  status text not null default 'active',
  god_expires_at timestamptz,
  god_tier text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);
create index if not exists profiles_role_idx on profiles (role);
create index if not exists profiles_email_idx on profiles (email);

create table if not exists products (
  id serial primary key,
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  category text not null default 'software',
  price_cents integer,
  billing text not null default 'one_time',
  billing_interval text,
  demo_url text,
  video_url text,
  features text not null default '',
  vanta_ready boolean not null default false,
  featured boolean not null default false,
  status text not null default 'published',
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id serial primary key,
  user_id text not null,
  product_id integer not null,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  billing text not null default 'one_time',
  status text not null default 'pending',
  stripe_session_id text,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on orders (user_id);

create table if not exists subscriptions (
  id serial primary key,
  user_id text not null,
  product_id integer not null,
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on subscriptions (user_id);

create table if not exists tickets (
  id serial primary key,
  user_id text not null,
  subject text not null,
  body text not null default '',
  status text not null default 'open',
  priority text not null default 'normal',
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tickets_user_idx on tickets (user_id);
create index if not exists tickets_status_idx on tickets (status);

create table if not exists ticket_messages (
  id serial primary key,
  ticket_id integer not null,
  user_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists god_codes (
  id serial primary key,
  code_hash text not null unique,
  code_prefix text not null,
  tier text not null,
  expires_at timestamptz,
  max_uses integer not null default 1,
  used_count integer not null default 0,
  created_by text not null,
  created_at timestamptz not null default now(),
  note text,
  last_redeemed_by text,
  last_redeemed_at timestamptz
);

create table if not exists audit_logs (
  id serial primary key,
  actor_id text,
  actor_email text,
  action text not null,
  target_type text,
  target_id text,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx on audit_logs (actor_id);

create table if not exists sentinel_alerts (
  id serial primary key,
  severity text not null default 'info',
  title text not null,
  detail text not null default '',
  source text not null default 'system',
  related_log_id integer,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  acknowledged_by text,
  escalated_at timestamptz,
  resolved_at timestamptz
);

create table if not exists architect_state (
  id integer primary key,
  enabled boolean not null default false,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists architect_tasks (
  id serial primary key,
  title text not null,
  description text not null default '',
  proposed_action text not null default '',
  status text not null default 'pending',
  decision_note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  executed_at timestamptz
);

create table if not exists incidents (
  id serial primary key,
  title text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  summary text not null default '',
  created_by text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists contact_messages (
  id serial primary key,
  name text not null,
  email text not null,
  topic text not null default 'general',
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists usage_events (
  id serial primary key,
  user_id text,
  event_type text not null,
  product_id integer,
  meta text,
  created_at timestamptz not null default now()
);
create index if not exists usage_events_type_idx on usage_events (event_type);

create table if not exists campaigns (
  id serial primary key,
  title text not null,
  channel text not null default 'web',
  status text not null default 'draft',
  body text not null default '',
  created_by text,
  created_at timestamptz not null default now()
);

insert into architect_state (id, enabled)
  values (1, false)
  on conflict (id) do nothing;
