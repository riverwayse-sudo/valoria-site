-- Reconcile existing capability rows against the newly enforced evidence rules.
-- The preceding CV backfill intentionally marks historical documents pending;
-- this migration recalculates their eligibility and refreshes the public projection.
do $reconcile$
declare
  capability_row record;
  professional_row record;
begin
  for capability_row in
    select pc.professional_id, pc.capability
    from public.professional_capabilities pc
    where pc.is_active = true
    order by pc.professional_id, pc.capability
  loop
    perform private.refresh_existing_professional_capability(
      capability_row.professional_id,
      capability_row.capability
    );
  end loop;

  -- Rebuild every existing roster projection, including basic/taster listings.
  -- This keeps first-stage discoverability intact while removing unapproved
  -- full-assessment capability categories.
  for professional_row in
    select ids.professional_id
    from (
      select mpr.professional_id from public.marketplace_public_roster mpr
      union
      select pc.professional_id from public.professional_capabilities pc
    ) ids
    order by ids.professional_id
  loop
    perform public.refresh_marketplace_public_roster(professional_row.professional_id);
  end loop;
end;
$reconcile$;
