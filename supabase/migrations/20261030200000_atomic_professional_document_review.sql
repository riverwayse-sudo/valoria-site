-- Atomically append an administrator decision and synchronize the evidence
-- status. The API authenticates the admin first; this function independently
-- verifies the reviewer and performs both writes in one transaction.
create or replace function public.record_professional_document_review(
  p_document_id uuid,
  p_decision text,
  p_notes text,
  p_reviewed_by uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  document_row public.professional_documents;
  review_row public.professional_document_reviews;
  next_status text;
begin
  if p_decision not in ('approved','changes_requested','rejected') then
    raise exception 'Unsupported evidence review decision';
  end if;
  if p_notes is null or length(trim(p_notes)) not between 1 and 3000 then
    raise exception 'A review note between 1 and 3000 characters is required';
  end if;
  if p_reviewed_by is null or not exists (
    select 1 from public.admin_users where id=p_reviewed_by
  ) then
    raise exception 'Reviewer is not an authorised Valoria administrator';
  end if;

  select * into document_row
  from public.professional_documents
  where id=p_document_id
  for update;

  if not found then
    raise exception 'Evidence record not found';
  end if;

  next_status:=case
    when p_decision='approved' then 'verified'
    when p_decision='rejected' then 'rejected'
    else 'pending'
  end;

  insert into public.professional_document_reviews(
    document_id,capability_id,decision,notes,reviewed_by,reviewed_at
  ) values (
    document_row.id,document_row.capability_id,p_decision,trim(p_notes),p_reviewed_by,now()
  )
  returning * into review_row;

  update public.professional_documents
  set verification_status=next_status,
      verified_by=case when p_decision='approved' then p_reviewed_by else null end,
      verified_at=case when p_decision='approved' then review_row.reviewed_at else null end,
      updated_at=now()
  where id=document_row.id;

  return jsonb_build_object(
    'review',to_jsonb(review_row),
    'verification_status',next_status
  );
end;
$function$;

revoke all on function public.record_professional_document_review(uuid,text,text,uuid) from public, anon, authenticated;
grant execute on function public.record_professional_document_review(uuid,text,text,uuid) to service_role;
