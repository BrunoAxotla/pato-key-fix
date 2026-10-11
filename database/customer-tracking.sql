-- PATO customer tracking capability.
-- Review this script before applying it to Supabase. It is intentionally
-- additive and does not alter or drop existing tables or functions.

create table public.customer_tracking_tokens (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null unique
    references public.service_requests(id) on delete cascade,
  token_hash text not null unique
    check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  check (expires_at > created_at)
);

alter table public.customer_tracking_tokens enable row level security;

revoke all on table public.customer_tracking_tokens
  from public, anon, authenticated;
grant select, insert on table public.customer_tracking_tokens to service_role;

-- This wrapper makes request creation and token registration one transaction.
-- The existing create_service_request function remains intact.
create function public.create_service_request_with_tracking(
  p_customer jsonb,
  p_service jsonb,
  p_vehicle jsonb,
  p_domestic jsonb,
  p_commercial jsonb,
  p_address jsonb,
  p_token_hash text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_request jsonb;
  v_request_id uuid;
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'TRACKING_TOKEN_HASH_INVALID' using errcode = '22023';
  end if;

  v_request := public.create_service_request(
    p_customer,
    p_service,
    p_vehicle,
    p_domestic,
    p_commercial,
    p_address
  );

  v_request_id := nullif(v_request ->> 'service_request_id', '')::uuid;
  if v_request_id is null then
    raise exception 'SERVICE_REQUEST_ID_MISSING' using errcode = 'P0001';
  end if;

  insert into public.customer_tracking_tokens (
    service_request_id,
    token_hash,
    expires_at
  ) values (
    v_request_id,
    p_token_hash,
    now() + interval '30 days'
  );

  return v_request;
end;
$$;

revoke all on function public.create_service_request_with_tracking(
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text
) from public, anon, authenticated;
grant execute on function public.create_service_request_with_tracking(
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text
) to service_role;

-- Return only fields used by the customer tracking screen. In particular,
-- this omits the request UUID, free-form description, address details,
-- schedule, contact data, photos, and payment data.
create function public.get_customer_tracking_request_by_hash(
  p_token_hash text
)
returns table (
  status text,
  service_type text,
  service_needed text,
  state text,
  municipality text,
  vehicle_brand text,
  vehicle_model text,
  vehicle_year integer,
  key_type text,
  locksmith_first_name text,
  locksmith_last_name text,
  locksmith_business_name text
)
language sql
security invoker
stable
set search_path = ''
as $$
  select
    sr.status,
    sr.service_type,
    sr.service_needed,
    a.state,
    a.municipality,
    vd.brand,
    vd.model,
    vd.year,
    vd.key_type,
    l.first_name,
    l.last_name,
    l.business_name
  from public.customer_tracking_tokens ct
  join public.service_requests sr
    on sr.id = ct.service_request_id
  join public.addresses a
    on a.service_request_id = sr.id
  left join public.vehicle_details vd
    on vd.service_request_id = sr.id
  left join lateral (
    select sa2.locksmith_id
    from public.service_assignments sa2
    where sa2.service_request_id = sr.id
      and sa2.status in ('assigned', 'in_progress', 'completed')
    order by sa2.accepted_at desc nulls last, sa2.created_at desc
    limit 1
  ) sa on true
  left join public.locksmiths l
    on l.id = sa.locksmith_id
  where ct.token_hash = p_token_hash
    and ct.revoked_at is null
    and ct.expires_at > now()
    and p_token_hash ~ '^[0-9a-f]{64}$'
  limit 1;
$$;

revoke all on function public.get_customer_tracking_request_by_hash(text)
  from public, anon, authenticated;
grant execute on function public.get_customer_tracking_request_by_hash(text)
  to service_role;

notify pgrst, 'reload schema';
