create or replace function public.check_rate_limit(p_key text, p_max_count integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rate_limits%rowtype;
  v_now timestamptz := now();
begin
  if p_key is null or length(p_key) < 3 or length(p_key) > 200 then
    raise exception 'Invalid rate-limit key';
  end if;
  if p_max_count < 1 or p_max_count > 1000 then
    raise exception 'Invalid rate-limit maximum';
  end if;
  if p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate-limit window';
  end if;

  select * into v_row
  from public.rate_limits
  where key = p_key
  for update;

  if v_row is null then
    insert into public.rate_limits (key, count, window_start)
    values (p_key, 1, v_now);
    return true;
  end if;

  if v_now - v_row.window_start > (p_window_seconds || ' seconds')::interval then
    update public.rate_limits
      set count = 1, window_start = v_now
      where key = p_key;
    return true;
  end if;

  if v_row.count >= p_max_count then
    return false;
  end if;

  update public.rate_limits
    set count = count + 1
    where key = p_key;
  return true;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to anon, authenticated;
