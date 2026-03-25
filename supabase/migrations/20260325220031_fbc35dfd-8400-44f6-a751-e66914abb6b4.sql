
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Store settings
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'Minha Loja',
  logo_url TEXT,
  banner_url TEXT,
  whatsapp TEXT,
  instagram TEXT,
  address TEXT,
  hide_address BOOLEAN NOT NULL DEFAULT false,
  store_open BOOLEAN NOT NULL DEFAULT true,
  store_suspended BOOLEAN NOT NULL DEFAULT false,
  pix_key TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Business hours
CREATE TABLE public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL DEFAULT '08:00',
  close_time TIME NOT NULL DEFAULT '18:00',
  is_active BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(day_of_week)
);
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- Delivery zones
CREATE TABLE public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distance_km NUMERIC NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

-- Credit card installments
CREATE TABLE public.installment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installments INTEGER NOT NULL,
  interest_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.installment_rules ENABLE ROW LEVEL SECURITY;

-- Coupons
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  youtube_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product images
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  address TEXT,
  payment_method TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','preparing','delivering','completed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Cash register
CREATE TABLE public.cash_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  closing_balance NUMERIC,
  user_id UUID REFERENCES auth.users(id),
  is_open BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;

-- Cash transactions
CREATE TABLE public.cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  register_id UUID REFERENCES public.cash_registers(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- RLS POLICIES

-- Profiles: users read own, admins read all
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User roles: only admins
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Store settings: public read, admin write
CREATE POLICY "Anyone can read settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.store_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Business hours: public read, admin write
CREATE POLICY "Anyone can read hours" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "Admins manage hours" ON public.business_hours FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Delivery zones: public read, admin write
CREATE POLICY "Anyone can read zones" ON public.delivery_zones FOR SELECT USING (true);
CREATE POLICY "Admins manage zones" ON public.delivery_zones FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Installment rules: public read, admin write
CREATE POLICY "Anyone can read installments" ON public.installment_rules FOR SELECT USING (true);
CREATE POLICY "Admins manage installments" ON public.installment_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Coupons: public read, admin write
CREATE POLICY "Anyone can read coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Categories: public read, admin write
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Products: public read, admin write
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Product images: public read, admin write
CREATE POLICY "Anyone can read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Orders: admin access all
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Order items: admin access all
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Cash registers: admin only
CREATE POLICY "Admins manage cash registers" ON public.cash_registers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Cash transactions: admin only
CREATE POLICY "Admins manage cash transactions" ON public.cash_transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert default store settings
INSERT INTO public.store_settings (store_name) VALUES ('Minha Loja');

-- Insert default business hours (Mon-Sun)
INSERT INTO public.business_hours (day_of_week, open_time, close_time, is_active) VALUES
  (0, '08:00', '18:00', false),
  (1, '08:00', '18:00', true),
  (2, '08:00', '18:00', true),
  (3, '08:00', '18:00', true),
  (4, '08:00', '18:00', true),
  (5, '08:00', '18:00', true),
  (6, '08:00', '18:00', false);

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('store-assets', 'store-assets', true);

-- Storage policies
CREATE POLICY "Anyone can read store assets" ON storage.objects FOR SELECT USING (bucket_id = 'store-assets');
CREATE POLICY "Admins can upload store assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'store-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update store assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'store-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete store assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'store-assets' AND public.has_role(auth.uid(), 'admin'));
