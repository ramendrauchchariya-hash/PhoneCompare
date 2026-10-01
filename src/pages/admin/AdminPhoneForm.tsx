import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, Trash2, Plus, X, ArrowLeft, Upload } from 'lucide-react';
import supabase from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { slugify } from '@/utils/format';
import type { Brand } from '@/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface VariantData {
  id?: string;
  ram: string;
  storage: string;
  color: string;
  sku: string;
  price: string;
  availability: string;
}

interface ImageData {
  id?: string;
  image_url: string;
  alt_text: string;
}

interface PhoneFormData {
  brand_id: string;
  name: string;
  slug: string;
  model_number: string;
  description: string;
  release_date: string;
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  rating: number;
  review_count: number;
  display_size: string;
  display_type: string;
  resolution: string;
  refresh_rate: string;
  peak_brightness: string;
  hdr: string;
  protection: string;
  processor: string;
  chipset_brand: string;
  cpu: string;
  gpu: string;
  ram_options: string;
  storage_options: string;
  expandable_storage: string;
  main_camera: string;
  ultrawide_camera: string;
  telephoto_camera: string;
  macro_camera: string;
  front_camera: string;
  video_recording: string;
  ois: string;
  camera_features: string;
  battery_capacity: string;
  charging_speed: string;
  wireless_charging: string;
  reverse_charging: string;
  has_5g: boolean;
  has_nfc: boolean;
  wifi: string;
  bluetooth: string;
  usb: string;
  gps: string;
  sim: string;
  os: string;
  dimensions: string;
  weight: string;
  fingerprint_sensor: string;
  face_unlock: string;
  water_resistance: string;
  stereo_speakers: boolean;
  headphone_jack: boolean;
  meta_title: string;
  meta_description: string;
  keywords: string;
}

const emptyForm: PhoneFormData = {
  brand_id: '', name: '', slug: '', model_number: '', description: '', release_date: '', status: 'draft',
  is_featured: false, is_trending: false, rating: 0, review_count: 0,
  display_size: '', display_type: '', resolution: '', refresh_rate: '', peak_brightness: '', hdr: '', protection: '',
  processor: '', chipset_brand: '', cpu: '', gpu: '', ram_options: '', storage_options: '', expandable_storage: '',
  main_camera: '', ultrawide_camera: '', telephoto_camera: '', macro_camera: '', front_camera: '', video_recording: '', ois: '', camera_features: '',
  battery_capacity: '', charging_speed: '', wireless_charging: '', reverse_charging: '',
  has_5g: false, has_nfc: false, wifi: '', bluetooth: '', usb: '', gps: '', sim: '',
  os: '', dimensions: '', weight: '', fingerprint_sensor: '', face_unlock: '', water_resistance: '', stereo_speakers: false, headphone_jack: false,
  meta_title: '', meta_description: '', keywords: '',
};

export default function AdminPhoneForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState<PhoneFormData>(emptyForm);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [colors, setColors] = useState<{ id?: string; name: string; hex_code: string }[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'camera' | 'battery' | 'connectivity' | 'variants' | 'images' | 'seo'>('basic');

  useEffect(() => {
    fetchBrands().then(setBrands).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const { data } = await supabase.from('phones').select('*').eq('id', id).single();
        if (data) {
          setForm({ ...emptyForm, ...data });
          const { data: variantsData } = await supabase.from('phone_variants').select('*').eq('phone_id', id);
          setVariants((variantsData ?? []).map((v: Record<string, unknown>) => ({
            id: v.id as string, ram: (v.ram as string) || '', storage: (v.storage as string) || '', color: (v.color as string) || '',
            sku: (v.sku as string) || '', price: String(v.price ?? ''), availability: (v.availability as string) || 'In Stock',
          })));
          const { data: imagesData } = await supabase.from('phone_images').select('*').eq('phone_id', id).order('display_order');
          setImages((imagesData ?? []).map((img: Record<string, unknown>) => ({ id: img.id as string, image_url: img.image_url as string, alt_text: (img.alt_text as string) || '' })));
          const { data: colorsData } = await supabase.from('phone_colors').select('*').eq('phone_id', id);
          setColors((colorsData ?? []).map((c: Record<string, unknown>) => ({ id: c.id as string, name: (c.name as string) || '', hex_code: (c.hex_code as string) || '' })));
        }
      } catch (err) {
        console.error('Failed to load phone:', err);
        showToast('Failed to load phone data', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, showToast]);

  const update = (field: keyof PhoneFormData, value: string | boolean | number) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (publish = false) => {
    if (!form.brand_id) { showToast('Please select a brand', 'error'); return; }
    if (!form.name.trim()) { showToast('Please enter a phone name', 'error'); return; }
    setSaving(true);
    const slug = form.slug || slugify(form.name);
    const payload = { ...form, slug, status: publish ? 'published' : form.status, ram_options: form.ram_options, storage_options: form.storage_options };
    try {
      let phoneId = id;
      if (isEdit && phoneId) {
        const { error } = await supabase.from('phones').update(payload).eq('id', phoneId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('phones').insert(payload).select('id').single();
        if (error) throw error;
        phoneId = data.id;
      }

      if (phoneId) {
        // Save variants
        for (const v of variants) {
          const variantPayload = { phone_id: phoneId, ram: v.ram, storage: v.storage, color: v.color, sku: v.sku, price: v.price ? Number(v.price) : null, availability: v.availability };
          if (v.id) {
            await supabase.from('phone_variants').update(variantPayload).eq('id', v.id);
          } else {
            await supabase.from('phone_variants').insert(variantPayload);
          }
        }
        // Save images
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (!img.image_url) continue;
          const imgPayload = { phone_id: phoneId, image_url: img.image_url, alt_text: img.alt_text, display_order: i };
          if (img.id) {
            await supabase.from('phone_images').update(imgPayload).eq('id', img.id);
          } else {
            await supabase.from('phone_images').insert(imgPayload);
          }
        }
        // Save colors
        for (const c of colors) {
          if (!c.name) continue;
          const colorPayload = { phone_id: phoneId, name: c.name, hex_code: c.hex_code };
          if (c.id) {
            await supabase.from('phone_colors').update(colorPayload).eq('id', c.id);
          } else {
            await supabase.from('phone_colors').insert(colorPayload);
          }
        }
      }

      showToast(publish ? 'Phone published successfully' : 'Phone saved successfully', 'success');
      navigate('/admin/phones');
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Failed to save phone', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const { error } = await supabase.from('phones').delete().eq('id', id);
    if (error) {
      showToast('Failed to delete phone', 'error');
    } else {
      showToast('Phone deleted', 'success');
      navigate('/admin/phones');
    }
    setShowDelete(false);
  };

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'specs', label: 'Display & Performance' },
    { key: 'camera', label: 'Camera' },
    { key: 'battery', label: 'Battery & Other' },
    { key: 'connectivity', label: 'Connectivity' },
    { key: 'variants', label: 'Variants' },
    { key: 'images', label: 'Images & Colors' },
    { key: 'seo', label: 'SEO' },
  ];

  const inputClass = 'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white';
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  if (loading) {
    return <div className="h-96 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link to="/admin/phones" className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">{isEdit ? 'Edit Phone' : 'Add Phone'}</h1>
        {isEdit && (
          <button onClick={() => setShowDelete(true)} className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Brand *</label>
              <select value={form.brand_id} onChange={(e) => update('brand_id', e.target.value)} className={inputClass}>
                <option value="">Select brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Phone Name *</label>
              <input type="text" value={form.name} onChange={(e) => { update('name', e.target.value); if (!isEdit) update('slug', slugify(e.target.value)); }} className={inputClass} placeholder="Samsung Galaxy S26" />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input type="text" value={form.slug} onChange={(e) => update('slug', e.target.value)} className={inputClass} placeholder="samsung-galaxy-s26" />
            </div>
            <div>
              <label className={labelClass}>Model Number</label>
              <input type="text" value={form.model_number} onChange={(e) => update('model_number', e.target.value)} className={inputClass} placeholder="SM-S931B" />
            </div>
            <div>
              <label className={labelClass}>Release Date</label>
              <input type="date" value={form.release_date} onChange={(e) => update('release_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Rating (0-5)</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => update('rating', Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Review Count</label>
              <input type="number" min="0" value={form.review_count} onChange={(e) => update('review_count', Number(e.target.value))} className={inputClass} />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_trending} onChange={(e) => update('is_trending', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Trending</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className={inputClass} placeholder="Phone description..." />
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="md:col-span-2 text-sm font-semibold text-gray-900 dark:text-white">Display</h3>
            <div><label className={labelClass}>Display Size</label><input type="text" value={form.display_size} onChange={(e) => update('display_size', e.target.value)} className={inputClass} placeholder='6.2"' /></div>
            <div><label className={labelClass}>Panel Type</label><input type="text" value={form.display_type} onChange={(e) => update('display_type', e.target.value)} className={inputClass} placeholder="AMOLED" /></div>
            <div><label className={labelClass}>Resolution</label><input type="text" value={form.resolution} onChange={(e) => update('resolution', e.target.value)} className={inputClass} placeholder="1080x2340" /></div>
            <div><label className={labelClass}>Refresh Rate</label><input type="text" value={form.refresh_rate} onChange={(e) => update('refresh_rate', e.target.value)} className={inputClass} placeholder="120Hz" /></div>
            <div><label className={labelClass}>Peak Brightness</label><input type="text" value={form.peak_brightness} onChange={(e) => update('peak_brightness', e.target.value)} className={inputClass} placeholder="2600 nits" /></div>
            <div><label className={labelClass}>HDR</label><input type="text" value={form.hdr} onChange={(e) => update('hdr', e.target.value)} className={inputClass} placeholder="HDR10+" /></div>
            <div><label className={labelClass}>Protection</label><input type="text" value={form.protection} onChange={(e) => update('protection', e.target.value)} className={inputClass} placeholder="Gorilla Glass" /></div>
            <h3 className="md:col-span-2 text-sm font-semibold text-gray-900 dark:text-white mt-4">Performance</h3>
            <div><label className={labelClass}>Processor</label><input type="text" value={form.processor} onChange={(e) => update('processor', e.target.value)} className={inputClass} placeholder="Snapdragon 8 Elite" /></div>
            <div><label className={labelClass}>Chipset Brand</label><input type="text" value={form.chipset_brand} onChange={(e) => update('chipset_brand', e.target.value)} className={inputClass} placeholder="Qualcomm" /></div>
            <div><label className={labelClass}>CPU</label><input type="text" value={form.cpu} onChange={(e) => update('cpu', e.target.value)} className={inputClass} placeholder="Octa-core" /></div>
            <div><label className={labelClass}>GPU</label><input type="text" value={form.gpu} onChange={(e) => update('gpu', e.target.value)} className={inputClass} placeholder="Adreno 830" /></div>
            <div><label className={labelClass}>RAM Options (JSON)</label><input type="text" value={form.ram_options} onChange={(e) => update('ram_options', e.target.value)} className={inputClass} placeholder='["8GB","12GB"]' /></div>
            <div><label className={labelClass}>Storage Options (JSON)</label><input type="text" value={form.storage_options} onChange={(e) => update('storage_options', e.target.value)} className={inputClass} placeholder='["128GB","256GB"]' /></div>
            <div><label className={labelClass}>Expandable Storage</label><input type="text" value={form.expandable_storage} onChange={(e) => update('expandable_storage', e.target.value)} className={inputClass} placeholder="Yes/No" /></div>
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Main Camera</label><input type="text" value={form.main_camera} onChange={(e) => update('main_camera', e.target.value)} className={inputClass} placeholder="200MP" /></div>
            <div><label className={labelClass}>Ultra-wide</label><input type="text" value={form.ultrawide_camera} onChange={(e) => update('ultrawide_camera', e.target.value)} className={inputClass} placeholder="50MP" /></div>
            <div><label className={labelClass}>Telephoto</label><input type="text" value={form.telephoto_camera} onChange={(e) => update('telephoto_camera', e.target.value)} className={inputClass} placeholder="10MP" /></div>
            <div><label className={labelClass}>Macro</label><input type="text" value={form.macro_camera} onChange={(e) => update('macro_camera', e.target.value)} className={inputClass} placeholder="2MP" /></div>
            <div><label className={labelClass}>Front Camera</label><input type="text" value={form.front_camera} onChange={(e) => update('front_camera', e.target.value)} className={inputClass} placeholder="12MP" /></div>
            <div><label className={labelClass}>Video Recording</label><input type="text" value={form.video_recording} onChange={(e) => update('video_recording', e.target.value)} className={inputClass} placeholder="8K@30fps" /></div>
            <div><label className={labelClass}>OIS</label><input type="text" value={form.ois} onChange={(e) => update('ois', e.target.value)} className={inputClass} placeholder="Yes/No" /></div>
            <div className="md:col-span-2"><label className={labelClass}>Camera Features</label><input type="text" value={form.camera_features} onChange={(e) => update('camera_features', e.target.value)} className={inputClass} placeholder="Night Mode, AI Portrait" /></div>
          </div>
        )}

        {activeTab === 'battery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="md:col-span-2 text-sm font-semibold text-gray-900 dark:text-white">Battery</h3>
            <div><label className={labelClass}>Battery Capacity</label><input type="text" value={form.battery_capacity} onChange={(e) => update('battery_capacity', e.target.value)} className={inputClass} placeholder="5000mAh" /></div>
            <div><label className={labelClass}>Charging Speed</label><input type="text" value={form.charging_speed} onChange={(e) => update('charging_speed', e.target.value)} className={inputClass} placeholder="100W wired" /></div>
            <div><label className={labelClass}>Wireless Charging</label><input type="text" value={form.wireless_charging} onChange={(e) => update('wireless_charging', e.target.value)} className={inputClass} placeholder="Yes/No" /></div>
            <div><label className={labelClass}>Reverse Charging</label><input type="text" value={form.reverse_charging} onChange={(e) => update('reverse_charging', e.target.value)} className={inputClass} placeholder="Yes/No" /></div>
            <h3 className="md:col-span-2 text-sm font-semibold text-gray-900 dark:text-white mt-4">Other</h3>
            <div><label className={labelClass}>OS</label><input type="text" value={form.os} onChange={(e) => update('os', e.target.value)} className={inputClass} placeholder="Android 15" /></div>
            <div><label className={labelClass}>Dimensions</label><input type="text" value={form.dimensions} onChange={(e) => update('dimensions', e.target.value)} className={inputClass} placeholder="158 x 72 x 7.6 mm" /></div>
            <div><label className={labelClass}>Weight</label><input type="text" value={form.weight} onChange={(e) => update('weight', e.target.value)} className={inputClass} placeholder="168g" /></div>
            <div><label className={labelClass}>Fingerprint Sensor</label><input type="text" value={form.fingerprint_sensor} onChange={(e) => update('fingerprint_sensor', e.target.value)} className={inputClass} placeholder="Under-display" /></div>
            <div><label className={labelClass}>Face Unlock</label><input type="text" value={form.face_unlock} onChange={(e) => update('face_unlock', e.target.value)} className={inputClass} placeholder="Yes/No" /></div>
            <div><label className={labelClass}>Water Resistance</label><input type="text" value={form.water_resistance} onChange={(e) => update('water_resistance', e.target.value)} className={inputClass} placeholder="IP68" /></div>
            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.stereo_speakers} onChange={(e) => update('stereo_speakers', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Stereo Speakers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.headphone_jack} onChange={(e) => update('headphone_jack', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">3.5mm Jack</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'connectivity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Wi-Fi</label><input type="text" value={form.wifi} onChange={(e) => update('wifi', e.target.value)} className={inputClass} placeholder="Wi-Fi 7" /></div>
            <div><label className={labelClass}>Bluetooth</label><input type="text" value={form.bluetooth} onChange={(e) => update('bluetooth', e.target.value)} className={inputClass} placeholder="5.4" /></div>
            <div><label className={labelClass}>USB</label><input type="text" value={form.usb} onChange={(e) => update('usb', e.target.value)} className={inputClass} placeholder="USB-C 3.2" /></div>
            <div><label className={labelClass}>GPS</label><input type="text" value={form.gps} onChange={(e) => update('gps', e.target.value)} className={inputClass} placeholder="GPS, GLONASS" /></div>
            <div><label className={labelClass}>SIM</label><input type="text" value={form.sim} onChange={(e) => update('sim', e.target.value)} className={inputClass} placeholder="Dual SIM" /></div>
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.has_5g} onChange={(e) => update('has_5g', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">5G</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.has_nfc} onChange={(e) => update('has_nfc', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">NFC</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'variants' && (
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <div><label className={labelClass}>RAM</label><input type="text" value={v.ram} onChange={(e) => { const n = [...variants]; n[i] = { ...v, ram: e.target.value }; setVariants(n); }} className={inputClass} placeholder="8GB" /></div>
                <div><label className={labelClass}>Storage</label><input type="text" value={v.storage} onChange={(e) => { const n = [...variants]; n[i] = { ...v, storage: e.target.value }; setVariants(n); }} className={inputClass} placeholder="128GB" /></div>
                <div><label className={labelClass}>SKU</label><input type="text" value={v.sku} onChange={(e) => { const n = [...variants]; n[i] = { ...v, sku: e.target.value }; setVariants(n); }} className={inputClass} placeholder="SM-S931-8-128" /></div>
                <div><label className={labelClass}>Price (₹)</label><input type="number" value={v.price} onChange={(e) => { const n = [...variants]; n[i] = { ...v, price: e.target.value }; setVariants(n); }} className={inputClass} placeholder="73499" /></div>
                <div><label className={labelClass}>Availability</label><select value={v.availability} onChange={(e) => { const n = [...variants]; n[i] = { ...v, availability: e.target.value }; setVariants(n); }} className={inputClass}><option>In Stock</option><option>Out of Stock</option></select></div>
                <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => setVariants([...variants, { ram: '', storage: '', color: '', sku: '', price: '', availability: 'In Stock' }])} className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors w-full">
              <Plus className="w-4 h-4" /> Add Variant
            </button>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Images</h3>
              {images.map((img, i) => (
                <div key={i} className="flex gap-2 items-end mb-2">
                  <div className="flex-1"><label className={labelClass}>Image URL</label><input type="text" value={img.image_url} onChange={(e) => { const n = [...images]; n[i] = { ...img, image_url: e.target.value }; setImages(n); }} className={inputClass} placeholder="https://..." /></div>
                  <div className="flex-1"><label className={labelClass}>Alt Text</label><input type="text" value={img.alt_text} onChange={(e) => { const n = [...images]; n[i] = { ...img, alt_text: e.target.value }; setImages(n); }} className={inputClass} placeholder="Phone front view" /></div>
                  <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setImages([...images, { image_url: '', alt_text: '' }])} className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors mt-2">
                <Upload className="w-4 h-4" /> Add Image URL
              </button>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Colors</h3>
              {colors.map((c, i) => (
                <div key={i} className="flex gap-2 items-end mb-2">
                  <div className="flex-1"><label className={labelClass}>Color Name</label><input type="text" value={c.name} onChange={(e) => { const n = [...colors]; n[i] = { ...c, name: e.target.value }; setColors(n); }} className={inputClass} placeholder="Titanium Black" /></div>
                  <div className="w-32"><label className={labelClass}>Hex Code</label><input type="text" value={c.hex_code} onChange={(e) => { const n = [...colors]; n[i] = { ...c, hex_code: e.target.value }; setColors(n); }} className={inputClass} placeholder="#1A1A1A" /></div>
                  <button onClick={() => setColors(colors.filter((_, idx) => idx !== i))} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setColors([...colors, { name: '', hex_code: '' }])} className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors mt-2">
                <Plus className="w-4 h-4" /> Add Color
              </button>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="grid grid-cols-1 gap-4">
            <div><label className={labelClass}>Meta Title</label><input type="text" value={form.meta_title} onChange={(e) => update('meta_title', e.target.value)} className={inputClass} placeholder="Samsung Galaxy S26 Price in India" /></div>
            <div><label className={labelClass}>Meta Description</label><textarea value={form.meta_description} onChange={(e) => update('meta_description', e.target.value)} rows={3} className={inputClass} /></div>
            <div><label className={labelClass}>Keywords</label><input type="text" value={form.keywords} onChange={(e) => update('keywords', e.target.value)} className={inputClass} placeholder="samsung galaxy s26, s26 price" /></div>
          </div>
        )}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 mt-6 flex gap-3 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 -mx-4 md:-mx-8 px-4 md:px-8">
        <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
          Publish
        </button>
        <Link to="/admin/phones" className="rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Cancel
        </Link>
      </div>

      <ConfirmDialog open={showDelete} title="Delete Phone" message="This will permanently delete the phone and all its data. This cannot be undone." onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
    </div>
  );
}

async function fetchBrands(): Promise<Brand[]> {
  const { data } = await supabase.from('brands').select('*').order('name');
  return data ?? [];
}
