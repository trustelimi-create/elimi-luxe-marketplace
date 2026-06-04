
-- Enums
CREATE TYPE public.app_role AS ENUM ('super_admin', 'employee');
CREATE TYPE public.product_status AS ENUM ('available', 'sold', 'pending', 'reserved');

-- Updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

-- profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Super admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- user_roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Super admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true OR public.is_staff(auth.uid()));
CREATE POLICY "Super admins manage categories" ON public.categories
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RWF',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  condition TEXT,
  brand TEXT,
  quantity INT NOT NULL DEFAULT 1,
  status public.product_status NOT NULL DEFAULT 'available',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  district TEXT,
  sector TEXT,
  location_text TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  featured BOOLEAN NOT NULL DEFAULT false,
  views_count INT NOT NULL DEFAULT 0,
  extra_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_status_idx ON public.products(status);
CREATE INDEX products_created_at_idx ON public.products(created_at DESC);
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view non-pending products" ON public.products
  FOR SELECT USING (status <> 'pending' OR public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Creator or super admin can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- product_images
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE INDEX product_images_product_idx ON public.product_images(product_id);

CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);
CREATE POLICY "Staff can manage product images" ON public.product_images
  FOR ALL TO authenticated USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- product_likes (anonymous, session-based)
CREATE TABLE public.product_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, session_id)
);
GRANT SELECT, INSERT, DELETE ON public.product_likes TO anon, authenticated;
GRANT ALL ON public.product_likes TO service_role;
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;
CREATE INDEX product_likes_product_idx ON public.product_likes(product_id);

CREATE POLICY "Anyone can view likes" ON public.product_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can like" ON public.product_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can unlike own session" ON public.product_likes FOR DELETE USING (true);

-- whatsapp_clicks
CREATE TABLE public.whatsapp_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.whatsapp_clicks TO anon, authenticated;
GRANT SELECT ON public.whatsapp_clicks TO authenticated;
GRANT ALL ON public.whatsapp_clicks TO service_role;
ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record click" ON public.whatsapp_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view clicks" ON public.whatsapp_clicks
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- employee_reports
CREATE TABLE public.employee_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tasks_completed TEXT NOT NULL,
  products_uploaded INT NOT NULL DEFAULT 0,
  problems TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.employee_reports TO authenticated;
GRANT ALL ON public.employee_reports TO service_role;
ALTER TABLE public.employee_reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX employee_reports_user_idx ON public.employee_reports(user_id, created_at DESC);

CREATE POLICY "Employees view own reports" ON public.employee_reports
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Super admins view all reports" ON public.employee_reports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Employees submit own reports" ON public.employee_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.is_staff(auth.uid()));

-- handle_new_user trigger: auto-create profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed default categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Real Estate', 'real-estate', 1),
  ('Land', 'land', 2),
  ('Vehicles', 'vehicles', 3),
  ('Cars', 'cars', 4),
  ('Motorcycles', 'motorcycles', 5),
  ('Trucks', 'trucks', 6),
  ('Smartphones', 'smartphones', 7),
  ('Tablets', 'tablets', 8),
  ('Laptops', 'laptops', 9),
  ('Computers', 'computers', 10),
  ('Electronics', 'electronics', 11),
  ('TVs', 'tvs', 12),
  ('Cameras', 'cameras', 13),
  ('Furniture', 'furniture', 14),
  ('Fashion', 'fashion', 15),
  ('Accessories', 'accessories', 16),
  ('Rentals', 'rentals', 17),
  ('Services', 'services', 18),
  ('Home Equipment', 'home-equipment', 19),
  ('Office Equipment', 'office-equipment', 20),
  ('Others', 'others', 99);
