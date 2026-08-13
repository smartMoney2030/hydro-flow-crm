-- helpers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TYPE public.app_role AS ENUM ('admin','salesperson','scheduler','technician');

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text,
  phone text,
  role text NOT NULL DEFAULT 'technician',
  avatar_color text NOT NULL DEFAULT '#0ea5e9',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles_read" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- new user -> profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- core CRM tables
CREATE TABLE public.customers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  billing_address text NOT NULL DEFAULT '',
  property_address text NOT NULL DEFAULT '',
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  preferred_contact text NOT NULL DEFAULT 'phone',
  notes text NOT NULL DEFAULT '',
  lead_source text NOT NULL DEFAULT '',
  stage text,
  is_historical boolean NOT NULL DEFAULT false,
  import_batch_id text,
  enrolled_in_maintenance boolean NOT NULL DEFAULT false,
  assigned_salesperson_id text,
  assigned_technician_id text,
  original_sale_date text,
  original_install_date text,
  purchase_price numeric,
  payment_status text,
  previous_service_history text,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.leads (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id text REFERENCES public.customers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'New Lead',
  assigned_to text,
  water_concerns jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_equipment text NOT NULL DEFAULT '',
  sales_call_at timestamptz,
  follow_up_at timestamptz,
  quote_amount numeric,
  quote_status text NOT NULL DEFAULT 'Draft',
  lost_reason text,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.jobs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id text REFERENCES public.customers(id) ON DELETE CASCADE,
  lead_id text,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  system_type text NOT NULL DEFAULT '',
  addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_price numeric NOT NULL DEFAULT 0,
  deposit_required numeric NOT NULL DEFAULT 0,
  deposit_collected numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'Unpaid',
  invoice_number text NOT NULL DEFAULT '',
  sale_date text,
  status text NOT NULL DEFAULT 'Payment Pending',
  salesperson_id text,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.supply_orders (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  job_id text,
  vendor text NOT NULL DEFAULT '',
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_date text,
  expected_delivery text,
  actual_delivery text,
  tracking text,
  status text NOT NULL DEFAULT 'Draft',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sku text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  unit text NOT NULL DEFAULT 'ea',
  on_hand numeric NOT NULL DEFAULT 0,
  reorder_level numeric NOT NULL DEFAULT 0,
  reorder_qty numeric NOT NULL DEFAULT 0,
  vendor text,
  unit_cost numeric,
  location text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.installations (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id text REFERENCES public.customers(id) ON DELETE CASCADE,
  job_id text,
  address text NOT NULL DEFAULT '',
  start_at timestamptz,
  end_at timestamptz,
  technician_id text,
  status text NOT NULL DEFAULT 'Scheduled',
  equipment jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions text NOT NULL DEFAULT '',
  technician_notes text NOT NULL DEFAULT '',
  before_photos integer NOT NULL DEFAULT 0,
  after_photos integer NOT NULL DEFAULT 0,
  serials jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamptz,
  signature_captured boolean NOT NULL DEFAULT false,
  follow_up_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.equipment (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id text REFERENCES public.customers(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  serial text NOT NULL DEFAULT '',
  install_date text,
  warranty_expires text,
  status text NOT NULL DEFAULT 'Active',
  last_maintenance text,
  next_maintenance text,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.equipment_catalog (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.maintenance_visits (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id text REFERENCES public.customers(id) ON DELETE CASCADE,
  equipment_id text,
  due_date text,
  scheduled_at timestamptz,
  technician_id text,
  status text NOT NULL DEFAULT 'Active Maintenance Customer',
  work_performed text,
  parts_used jsonb NOT NULL DEFAULT '[]'::jsonb,
  payment_status text NOT NULL DEFAULT 'Unpaid',
  notes text NOT NULL DEFAULT '',
  completed_at timestamptz,
  next_due_date text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL DEFAULT '',
  description text,
  due_at timestamptz,
  assignee_id text,
  related_customer_id text,
  related_lead_id text,
  related_job_id text,
  priority text NOT NULL DEFAULT 'med',
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.calendar_events (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'sales-call',
  start_at timestamptz,
  end_at timestamptz,
  technician_id text,
  customer_id text,
  related_id text,
  color text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  href text,
  kind text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id text,
  action text NOT NULL DEFAULT '',
  entity text NOT NULL DEFAULT '',
  entity_id text,
  detail text,
  at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.automation_rules (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL DEFAULT '',
  trigger text NOT NULL DEFAULT '',
  effect text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  runs_today integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.automation_runs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rule_id text,
  status text NOT NULL DEFAULT 'success',
  detail text,
  at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.import_batches (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id text,
  source text NOT NULL DEFAULT 'manual',
  filename text,
  counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  customer_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  equipment_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  maintenance_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  event_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  lead_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  reversed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['customers','leads','jobs','supply_orders','inventory_items','installations','equipment','equipment_catalog','maintenance_visits','tasks','calendar_events','notifications','audit_logs','automation_rules','automation_runs','import_batches']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "%s_staff_all" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;