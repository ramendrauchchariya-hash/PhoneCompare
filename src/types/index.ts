export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  country: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Phone {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  model_number: string | null;
  description: string | null;
  release_date: string | null;
  status: 'draft' | 'published' | 'unpublished';
  is_featured: boolean;
  is_trending: boolean;
  rating: number;
  review_count: number;
  // Display
  display_size: string | null;
  display_type: string | null;
  resolution: string | null;
  refresh_rate: string | null;
  peak_brightness: string | null;
  hdr: string | null;
  protection: string | null;
  // Performance
  processor: string | null;
  chipset_brand: string | null;
  cpu: string | null;
  gpu: string | null;
  ram_options: string | null;
  storage_options: string | null;
  expandable_storage: string | null;
  // Camera
  main_camera: string | null;
  ultrawide_camera: string | null;
  telephoto_camera: string | null;
  macro_camera: string | null;
  front_camera: string | null;
  video_recording: string | null;
  ois: string | null;
  camera_features: string | null;
  // Battery
  battery_capacity: string | null;
  charging_speed: string | null;
  wireless_charging: string | null;
  reverse_charging: string | null;
  // Connectivity
  has_5g: boolean;
  has_nfc: boolean;
  wifi: string | null;
  bluetooth: string | null;
  usb: string | null;
  gps: string | null;
  sim: string | null;
  // Other
  os: string | null;
  dimensions: string | null;
  weight: string | null;
  fingerprint_sensor: string | null;
  face_unlock: string | null;
  water_resistance: string | null;
  stereo_speakers: boolean;
  headphone_jack: boolean;
  // SEO
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  // timestamps
  created_at: string;
  updated_at: string;
  // joined
  brand?: Brand;
  images?: PhoneImage[];
  variants?: PhoneVariant[];
  colors?: PhoneColor[];
  categories?: Category[];
  lowest_price?: number | null;
  lowest_store_name?: string | null;
  lowest_store_id?: string | null;
  lowest_store_slug?: string | null;
}

export interface PhoneVariant {
  id: string;
  phone_id: string;
  ram: string | null;
  storage: string | null;
  color: string | null;
  sku: string | null;
  price: number | null;
  availability: string;
  created_at: string;
  updated_at: string;
  store_prices?: StorePrice[];
}

export interface PhoneColor {
  id: string;
  phone_id: string;
  name: string;
  hex_code: string | null;
  display_order: number;
}

export interface PhoneImage {
  id: string;
  phone_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  affiliate_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface StorePrice {
  id: string;
  variant_id: string;
  store_id: string;
  price: number;
  mrp: number | null;
  availability: string;
  product_url: string | null;
  affiliate_url: string | null;
  source: string;
  last_checked_at: string;
  created_at: string;
  updated_at: string;
  store?: Store;
}

export interface PriceHistory {
  id: string;
  variant_id: string;
  store_id: string | null;
  price: number;
  recorded_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

export interface Review {
  id: string;
  phone_id: string;
  user_id: string | null;
  author_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  pros: string | null;
  cons: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  phone_id: string;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  variant_id: string;
  target_price: number;
  is_triggered: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  role: string;
  created_at: string;
}
