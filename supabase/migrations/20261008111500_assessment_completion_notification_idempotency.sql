create or replace function public.valoria_assessment_continuity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.completed_at is not null and (tg_op='INSERT' or old.completed_at is null) then
    perform public.valoria_record_journey_event(
      new.user_id,
      'valu_completed',
      'valu_assessment',
      new.id::text,
      jsonb_build_object(
        'total_score',new.total_score,
        'assessment_version',new.assessment_version,
        'report_status',new.report_status
      )
    );

    if new.user_id is not null
       and coalesce(new.total_score,0) >= 35
       and not exists (
         select 1
         from public.platform_notifications n
         where n.user_id = new.user_id
           and n.type = 'valu_completed'
           and n.action_url = '/profile/setup'
       ) then
      perform public.create_platform_notification(
        new.user_id,
        'valu_completed',
        'Your VALU assessment is complete',
        'Your professional presence is now discoverable. Complete your professional profile to unlock enhanced marketplace access and make your capability easier to find.',
        '/profile/setup'
      );
    end if;
  end if;
  return new;
end;
$function$;
