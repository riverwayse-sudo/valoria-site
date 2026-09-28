-- Align Phase 4 notification events with the existing platform_notifications schema.
drop function if exists public.create_platform_notification(uuid,text,text,text,text,uuid);
create or replace function public.create_platform_notification(p_user_id uuid,p_type text,p_title text,p_body text,p_action_url text default null)
returns void language plpgsql security definer set search_path=public
as $$ begin if p_user_id is null then return; end if; insert into public.platform_notifications(user_id,type,title,body,action_url) values(p_user_id,p_type,p_title,p_body,p_action_url); end $$;
revoke all on function public.create_platform_notification(uuid,text,text,text,text) from public,anon,authenticated;

create or replace function public.notify_application_status_change()
returns trigger language plpgsql security definer set search_path=public
as $$ begin if new.status is not distinct from old.status then return new; end if; perform public.create_platform_notification(new.professional_id,'application_status','Application update','Your application status is now '||replace(new.status,'_',' ')||'.','/dashboard'); return new; end $$;
revoke all on function public.notify_application_status_change() from public,anon,authenticated;

create or replace function public.notify_opportunity_publish()
returns trigger language plpgsql security definer set search_path=public
as $$ begin if new.status='published' and old.status is distinct from new.status then perform public.create_platform_notification(new.created_by,'opportunity_published','Opportunity published','Your opportunity “'||new.title||'” is now live.','/employer/dashboard'); end if; return new; end $$;
revoke all on function public.notify_opportunity_publish() from public,anon,authenticated;

create or replace function public.notify_opportunity_invite()
returns trigger language plpgsql security definer set search_path=public
as $$ declare v_title text; v_org text; begin select title,organisation_name into v_title,v_org from public.opportunities where id=new.opportunity_id; perform public.create_platform_notification(new.professional_id,'opportunity_invite','You have been invited','You have been invited to '||coalesce(v_title,'a Valoria opportunity')||coalesce(' by '||v_org,'')||'.','/opportunities'); return new; end $$;
revoke all on function public.notify_opportunity_invite() from public,anon,authenticated;
