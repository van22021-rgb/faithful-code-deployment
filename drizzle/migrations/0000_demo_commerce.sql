CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
CREATE POLICY role_read ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE TABLE public.demos (code text PRIMARY KEY CHECK(code ~ '^CQ-[WVE]-[0-9]{3,6}$'), name text NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 200), service text NOT NULL CHECK(service IN ('web','video','event')), tags text[] NOT NULL DEFAULT '{}', visual integer NOT NULL DEFAULT 1 CHECK(visual BETWEEN 1 AND 15), url text NOT NULL DEFAULT '' CHECK(url='' OR (url ~ '^https://[^[:space:]]+$' AND length(url)<=2000)), support text[] NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'available' CHECK(status IN ('available','slotout')), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.demos TO anon; GRANT SELECT,INSERT,UPDATE,DELETE ON public.demos TO authenticated; GRANT ALL ON public.demos TO service_role;
ALTER TABLE public.demos ENABLE ROW LEVEL SECURITY;
CREATE POLICY demo_read ON public.demos FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY demo_admin ON public.demos FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.demo_orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, account text NOT NULL, name text NOT NULL, fb text NOT NULL DEFAULT '', items jsonb NOT NULL, total numeric NOT NULL CHECK(total>0), status text NOT NULL DEFAULT 'received' CHECK(status IN ('received','processing','accepted','replied','done','rejected')), created_at timestamptz NOT NULL DEFAULT now(), due_at timestamptz NOT NULL DEFAULT (now()+interval '7 days'));
GRANT SELECT,UPDATE ON public.demo_orders TO authenticated; GRANT ALL ON public.demo_orders TO service_role;
ALTER TABLE public.demo_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_read ON public.demo_orders FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY order_admin_update ON public.demo_orders FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.place_demo_order(_items jsonb, _name text) RETURNS public.demo_orders LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE item jsonb; demo public.demos; result public.demo_orders; clean jsonb='[]'; amount numeric; sum_price numeric=0; account_email text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF jsonb_typeof(_items)<>'array' OR jsonb_array_length(_items) NOT BETWEEN 1 AND 30 OR length(trim(_name)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid order'; END IF;
 SELECT email INTO account_email FROM auth.users WHERE id=auth.uid();
 IF (SELECT count(DISTINCT x->>'code') FROM jsonb_array_elements(_items) x) <> jsonb_array_length(_items) THEN RAISE EXCEPTION 'Duplicate demo'; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(_items) ORDER BY value->>'code' LOOP
  SELECT * INTO demo FROM public.demos WHERE code=item->>'code' FOR SHARE;
  IF NOT FOUND OR demo.status<>'available' THEN RAISE EXCEPTION 'Demo unavailable'; END IF;
  IF item->>'fb' IS NULL OR length(item->>'fb')>2000 OR item->>'fb' !~ '^https?://(www\.|m\.|web\.|mbasic\.)?(facebook\.com|fb\.com|fb\.me)/[^[:space:]]+$' OR item->>'email' IS NULL OR length(item->>'email')>255 OR item->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR length(coalesce(item->>'note',''))>5000 THEN RAISE EXCEPTION 'Invalid contact information'; END IF;
  amount=(item->>'price')::numeric;
  IF amount IS NULL OR amount<=0 OR amount>1000000000000 OR amount<>trunc(amount) THEN RAISE EXCEPTION 'Invalid proposed price'; END IF;
  sum_price=sum_price+amount;
  clean=clean || jsonb_build_array(jsonb_build_object('code',demo.code,'name',demo.name,'svc',demo.service,'fb',item->>'fb','email',item->>'email','note',coalesce(item->>'note',''),'price',amount));
 END LOOP;
 INSERT INTO public.demo_orders(user_id,account,name,fb,items,total) VALUES(auth.uid(),account_email,trim(_name),clean->0->>'fb',clean,sum_price) RETURNING * INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.place_demo_order(jsonb,text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.place_demo_order(jsonb,text) TO authenticated;
