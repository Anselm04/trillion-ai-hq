create table if not exists product_prices (
  id serial primary key,
  product_id integer not null references products(id) on delete cascade,
  name text not null default '',
  amount_cents integer not null,
  billing text not null default 'subscription',
  billing_interval text,
  stripe_price_id text,
  stripe_product_id text,
  payment_link_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_prices_product_idx on product_prices (product_id);

create table if not exists payment_settings (
  id integer primary key default 1,
  stripe_secret_key text,
  stripe_publishable_key text,
  stripe_account_id text,
  alipay_enabled boolean not null default false,
  connected_at timestamptz,
  last_sync_at timestamptz,
  last_error text
);

insert into payment_settings (id) values (1) on conflict (id) do nothing;

alter table orders add column if not exists price_id integer;
