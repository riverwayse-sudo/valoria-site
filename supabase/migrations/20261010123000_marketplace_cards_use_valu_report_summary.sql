-- Marketplace cards must use a genuine VALU Index report insight, never participant-written bio/headline.
alter table public.marketplace_public_roster
  add column if not exists assessment_summary text;

create or replace function public.refresh_marketplace_public_roster(p_professional_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  p record;
  caps text[];
  is_revoked boolean := false;
  assessment_ok boolean := false;
  t record;
  report_text text;
  canonical_valu_index numeric;
  canonical_cluster_scores jsonb;
  canonical_designation text;
  valid_dimension_count integer := 0;
  strongest_dimension text;
  weakest_dimension text;
  descriptor_phrase text;
  strongest_score numeric;
  weakest_score numeric;
  assessment_summary text;
begin
  delete from public.marketplace_public_roster where professional_id = p_professional_id;

  select pp.*, u.user_type account_user_type
    into p
    from public.professional_profiles pp
    left join public.users u on u.id = pp.id
   where pp.id = p_professional_id;

  -- Preserve this explicitly approved marketplace account without changing its admin role.
  -- All other non-professional account types remain excluded.
  if p.id is null or (
    coalesce(p.account_user_type, 'professional') <> 'professional'
    and p_professional_id <> '68a5e7d8-e373-4bb5-82bd-c88ad509784c'::uuid
  ) then
    return;
  end if;

  select exists (
    select 1
      from public.professional_listing_events e
     where e.professional_id = p_professional_id
       and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
       and e.created_at = (
         select max(e2.created_at)
           from public.professional_listing_events e2
          where e2.professional_id = p_professional_id
       )
  ) into is_revoked;

  if is_revoked then return; end if;

  assessment_ok := private.valu_assessment_is_current(p_professional_id);

  if assessment_ok and p.visibility = 'public' and p.listing_status = 'listed' then
    caps := array(
      select distinct case when lower(x) = 'candidate' then 'talent' else lower(x) end
        from unnest(coalesce(p.active_tracks, '{}'::text[])) x
       where lower(x) in ('talent','candidate','speaker','facilitator')
    );
    if cardinality(caps) = 0 then caps := array['talent']::text[]; end if;
    caps := array(
      select x from unnest(caps) x
       order by case x when 'talent' then 1 when 'speaker' then 2 when 'facilitator' then 3 else 9 end
    );

    -- One canonical source for the score, PRIME evidence, tier and descriptor.
    select v.total_score, v.cluster_scores, v.designation, v.ai_report
      into canonical_valu_index, canonical_cluster_scores, canonical_designation, report_text
      from public.valu_assessments v
     where v.user_id = p_professional_id
       and v.completed_at is not null
       and coalesce(v.total_score, 0) >= 35
       and (v.expires_at is null or v.expires_at > now())
     order by v.completed_at desc, v.created_at desc
     limit 1;

    -- Retain an already-projected verified result if legacy ownership linkage is incomplete.
    canonical_valu_index := coalesce(canonical_valu_index, p.valu_index);
    canonical_cluster_scores := coalesce(canonical_cluster_scores, p.cluster_scores);
    canonical_designation := coalesce(canonical_designation, p.designation);

    -- Derive the public descriptor only from structured PRIME scores.
    -- The participant-facing AI coaching report is not suitable marketplace copy.
    if jsonb_typeof(canonical_cluster_scores) = 'object' then
      select count(*) into valid_dimension_count
        from jsonb_each_text(canonical_cluster_scores) s
       where s.key in ('P','R','I','M','E')
         and s.value ~ '^[0-9]+([.][0-9]+)?$';

      if valid_dimension_count = 5 then
        select case s.key
                 when 'P' then 'Presence' when 'R' then 'Relationships'
                 when 'I' then 'Intelligence' when 'M' then 'Mastery'
                 when 'E' then 'Enterprise'
               end, s.value::numeric
          into strongest_dimension, strongest_score
          from jsonb_each_text(canonical_cluster_scores) s
         where s.key in ('P','R','I','M','E')
           and s.value ~ '^[0-9]+([.][0-9]+)?$'
         order by s.value::numeric desc, array_position(array['P','R','I','M','E'], s.key)
         limit 1;

        select case s.key
                 when 'P' then 'Presence' when 'R' then 'Relationships'
                 when 'I' then 'Intelligence' when 'M' then 'Mastery'
                 when 'E' then 'Enterprise'
               end, s.value::numeric
          into weakest_dimension, weakest_score
          from jsonb_each_text(canonical_cluster_scores) s
         where s.key in ('P','R','I','M','E')
           and s.value ~ '^[0-9]+([.][0-9]+)?$'
         order by s.value::numeric asc, array_position(array['P','R','I','M','E'], s.key)
         limit 1;

        descriptor_phrase := case strongest_dimension
          when 'Presence' then 'A presence-led professional'
          when 'Relationships' then 'A relationship-centred professional'
          when 'Intelligence' then 'An analytically oriented professional'
          when 'Mastery' then 'A mastery-focused professional'
          when 'Enterprise' then 'An enterprise-minded professional'
        end;

        assessment_summary := case
          when strongest_score = weakest_score
            then 'A well-balanced capability profile across the five PRIME dimensions.'
          else descriptor_phrase || ', with further development in ' || weakest_dimension || '.'
        end;
      end if;
    end if;

    insert into public.marketplace_public_roster(
      professional_id, full_name, bio, location, languages, headline, current_job_title,
      capability, track, capabilities, atb_id, display_initials, photo_url, industry,
      skills, topics, programme_types, availability, valu_index, cluster_scores,
      designation, fee_range, salary_expectation, availability_status,
      projection_refreshed_at, assessment_access, assessment_summary
    )
    values(
      p.id, p.display_name, p.bio, p.location, p.languages, p.headline, p.current_job_title,
      caps[1],
      case when 'talent'=any(caps) then 'candidate' when 'speaker'=any(caps) then 'speaker' when 'facilitator'=any(caps) then 'facilitator' end,
      caps, p.atb_id, p.display_initials, p.photo_url, p.industry, p.skills, p.topics,
      p.programme_types, p.availability, canonical_valu_index, canonical_cluster_scores, canonical_designation,
      p.fee_range, p.salary_expectation, p.availability_status, now(), 'full', assessment_summary
    );
    return;
  end if;

  select * into t
    from public.taster_sessions
   where user_id = p_professional_id and completed_at is not null
   order by completed_at desc, created_at desc
   limit 1;

  if t.id is not null and p.listing_status = 'listed' and p.visibility in ('public','marketplace','registered_only') then
    insert into public.marketplace_public_roster(
      professional_id, full_name, bio, location, languages, headline, current_job_title,
      capability, track, capabilities, atb_id, display_initials, photo_url, industry,
      skills, topics, programme_types, availability, valu_index, cluster_scores,
      designation, fee_range, salary_expectation, availability_status,
      projection_refreshed_at, assessment_access, assessment_summary
    )
    values(
      p.id, coalesce(nullif(trim(p.display_name),''), nullif(trim(t.name),'')), null,
      p.location, p.languages, coalesce(nullif(trim(p.headline),''), nullif(trim(t.role),'')),
      p.current_job_title, 'talent', 'candidate', array['talent']::text[], p.atb_id,
      p.display_initials, p.photo_url, p.industry, p.skills, null, p.programme_types,
      p.availability, null, null, 'BASIC', p.fee_range, p.salary_expectation,
      p.availability_status, now(), 'basic', null
    );
  end if;
end;
$function$;


-- Rebuild the existing public roster so every current card receives the report-derived field.
do $backfill$
declare
  roster_row record;
begin
  for roster_row in
    select professional_id from public.marketplace_public_roster
  loop
    perform public.refresh_marketplace_public_roster(roster_row.professional_id);
  end loop;

  -- Include the preserved account even when the prior roster excluded it.
  perform public.refresh_marketplace_public_roster('68a5e7d8-e373-4bb5-82bd-c88ad509784c'::uuid);
end;
$backfill$;
