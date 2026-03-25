
-- Fix permissive INSERT policies on orders and order_items
-- Drop the overly permissive policies
DROP POLICY "Anyone can create orders" ON public.orders;
DROP POLICY "Anyone can create order items" ON public.order_items;

-- More specific: allow anonymous inserts but require essential fields
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (
  customer_name IS NOT NULL AND total >= 0
);
CREATE POLICY "Public can create order items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (
  order_id IS NOT NULL AND product_name IS NOT NULL AND quantity > 0
);
