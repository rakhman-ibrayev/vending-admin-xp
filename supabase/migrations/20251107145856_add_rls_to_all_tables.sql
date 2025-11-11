alter table "public"."machine_products" enable row level security;

alter table "public"."orders" enable row level security;

alter table "public"."products" enable row level security;

alter table "public"."vending_machines" enable row level security;


-- Allow authenticated users full access
create policy "Allow authenticated users"
on "public"."machine_products"
as permissive
for all
to authenticated
using (true)
with check (true);

create policy "Allow authenticated users"
on "public"."orders"
as permissive
for all
to authenticated
using (true)
with check (true);

create policy "Allow authenticated users"
on "public"."products"
as permissive
for all
to authenticated
using (true)
with check (true);

create policy "Allow authenticated users"
on "public"."vending_machines"
as permissive
for all
to authenticated
using (true)
with check (true);



