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
  report_section text;
  report_match text[];
  assessment_summary text;
begin
  delete from public.marketplace_public_roster where professional_id = p_professional_id;

  select pp.*, u.user_type account_user_type
    into p
    from public.professional_profiles pp
    left join public.users u on u.id = pp.id
   where pp.id = p_professional_id;

  if p.id is null or coalesce(p.account_user_type, 'professional') <> 'professional' then
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

    -- Use the same person's latest current, completed VALU report.
    select v.ai_report into report_text
      from public.valu_assessments v
     where v.user_id = p_professional_id
       and v.completed_at is not null
       and coalesce(v.total_score, 0) >= 35
       and (v.expires_at is null or v.expires_at > now())
     order by v.completed_at desc, v.created_at desc
     limit 1;

    -- Extract the report's own "What You Are Good At" opening paragraph.
    -- This is report text, not an AI-generated rewrite or member-entered profile copy.
    report_match := regexp_match(
      coalesce(report_text, ''),
      '(?is)##[[:space:]]*WHAT YOU ARE GOOD AT[[:space:]]*(.*?)(?=\n[[:space:]]*---|\n[[:space:]]*##[[:space:]]*WHERE YOU ARE LOSING GROUND)'
    );
    report_section := coalesce(report_match[1], '');
    report_section := regexp_replace(report_section, '^[[:space:]]*[-*][[:space:]]*', '', 'g');
    report_section := regexp_replace(report_section, '\*\*|__|[*_#]', '', 'g');
    report_section := regexp_replace(report_section, E'\n[[:space:]]*\n.*$', '', 's');
    report_section := regexp_replace(report_section, '[[:space:]]+', ' ', 'g');
    report_section := nullif(trim(report_section), '');
    assessment_summary := case
      when report_section is null then null
      when length(report_section) <= 320 then report_section
      else left(report_section, 317) || '…'
    end;

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
      p.programme_types, p.availability, p.valu_index, p.cluster_scores, p.designation,
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
