-- Track VALU report readiness and delivery as first-class journey events.
create or replace function public.valoria_assessment_report_continuity()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.report_status is distinct from old.report_status then
    if new.report_status in ('READY','EMAIL_PENDING') then
      perform public.valoria_record_journey_event(new.user_id,'valu_report_ready','valu_assessment',new.id::text,
        jsonb_build_object('report_status',new.report_status));
    elsif new.report_status='SENT' then
      perform public.valoria_record_journey_event(new.user_id,'valu_report_delivered','valu_assessment',new.id::text,
        jsonb_build_object('report_status',new.report_status,'report_email_sent_at',new.report_email_sent_at));
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.valoria_assessment_report_continuity() from public,anon,authenticated;
drop trigger if exists trg_valoria_assessment_report_continuity on public.valu_assessments;
create trigger trg_valoria_assessment_report_continuity
after update of report_status,report_email_sent_at on public.valu_assessments
for each row execute function public.valoria_assessment_report_continuity();
