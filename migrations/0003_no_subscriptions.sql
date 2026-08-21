-- Public site is a catalog, not a SaaS pricing page.
update products
set billing = 'one_time',
    billing_interval = null,
    price_cents = null
where billing = 'subscription';
