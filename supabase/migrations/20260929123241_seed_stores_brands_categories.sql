/*
# PhoneCompare — Sample Data

Inserts demo data: 10 stores, 12 brands, 10 categories, 16 phones with
variants, colors, images, store prices, and price history.

All data is clearly sample/demo data and can be replaced via the admin dashboard.
*/

-- ===== STORES =====
INSERT INTO stores (name, slug, website, is_active, display_order) VALUES
('Amazon', 'amazon', 'https://www.amazon.in', true, 1),
('Flipkart', 'flipkart', 'https://www.flipkart.com', true, 2),
('Croma', 'croma', 'https://www.croma.com', true, 3),
('Reliance Digital', 'reliance-digital', 'https://www.reliancedigital.in', true, 4),
('Vijay Sales', 'vijay-sales', 'https://www.vijaysales.com', true, 5),
('Tata CLiQ', 'tata-cliq', 'https://www.tatacliq.com', true, 6),
('Samsung Store', 'samsung-store', 'https://www.samsung.com', true, 7),
('Apple Store', 'apple-store', 'https://www.apple.com/in', true, 8),
('OnePlus Store', 'oneplus-store', 'https://www.oneplus.in', true, 9),
('Mi Store', 'mi-store', 'https://www.mi.com/in', true, 10)
ON CONFLICT (name) DO NOTHING;

-- ===== BRANDS =====
INSERT INTO brands (name, slug, country, is_active, display_order) VALUES
('Apple', 'apple', 'USA', true, 1),
('Samsung', 'samsung', 'South Korea', true, 2),
('OnePlus', 'oneplus', 'China', true, 3),
('Google', 'google', 'USA', true, 4),
('Xiaomi', 'xiaomi', 'China', true, 5),
('Realme', 'realme', 'China', true, 6),
('Vivo', 'vivo', 'China', true, 7),
('OPPO', 'oppo', 'China', true, 8),
('Motorola', 'motorola', 'USA', true, 9),
('Nothing', 'nothing', 'UK', true, 10),
('POCO', 'poco', 'China', true, 11),
('iQOO', 'iqoo', 'China', true, 12)
ON CONFLICT (name) DO NOTHING;

-- ===== CATEGORIES =====
INSERT INTO categories (name, slug, display_order) VALUES
('Under ₹15,000', 'under-15000', 1),
('₹15,000–₹25,000', '15000-25000', 2),
('₹25,000–₹40,000', '25000-40000', 3),
('₹40,000–₹60,000', '40000-60000', 4),
('₹60,000+', '60000-plus', 5),
('Best Camera Phones', 'best-camera', 6),
('Best Gaming Phones', 'best-gaming', 7),
('Best Battery Phones', 'best-battery', 8),
('5G Phones', '5g-phones', 9),
('Flagship Phones', 'flagship', 10)
ON CONFLICT (name) DO NOTHING;
