import type { Phone } from '@/types';

interface SpecRow {
  label: string;
  value: string | null | undefined;
  isBoolean?: boolean;
}

interface SpecSection {
  title: string;
  icon: string;
  rows: SpecRow[];
}

function parseArrayField(val: string | null | undefined): string | null {
  if (!val) return null;
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed.join(', ');
    return val;
  } catch {
    return val.replace(/[\[\]"]/g, '').replace(/,/g, ', ');
  }
}

export default function SpecificationTable({ phone }: { phone: Phone }) {
  const sections: SpecSection[] = [
    {
      title: 'General',
      icon: 'Info',
      rows: [
        { label: 'Brand', value: phone.brand?.name },
        { label: 'Model Number', value: phone.model_number },
        { label: 'Release Date', value: phone.release_date },
        { label: 'Operating System', value: phone.os },
        { label: 'Dimensions', value: phone.dimensions },
        { label: 'Weight', value: phone.weight },
        { label: 'Colors', value: phone.colors?.map((c) => c.name).join(', ') || null },
      ],
    },
    {
      title: 'Display',
      icon: 'Monitor',
      rows: [
        { label: 'Display Size', value: phone.display_size },
        { label: 'Panel Type', value: phone.display_type },
        { label: 'Resolution', value: phone.resolution },
        { label: 'Refresh Rate', value: phone.refresh_rate },
        { label: 'Peak Brightness', value: phone.peak_brightness },
        { label: 'HDR', value: phone.hdr },
        { label: 'Screen Protection', value: phone.protection },
      ],
    },
    {
      title: 'Performance',
      icon: 'Cpu',
      rows: [
        { label: 'Processor', value: phone.processor },
        { label: 'Chipset Brand', value: phone.chipset_brand },
        { label: 'CPU', value: phone.cpu },
        { label: 'GPU', value: phone.gpu },
        { label: 'RAM Options', value: parseArrayField(phone.ram_options) },
        { label: 'Storage Options', value: parseArrayField(phone.storage_options) },
        { label: 'Expandable Storage', value: phone.expandable_storage },
      ],
    },
    {
      title: 'Camera',
      icon: 'Camera',
      rows: [
        { label: 'Main Camera', value: phone.main_camera },
        { label: 'Ultra-wide Camera', value: phone.ultrawide_camera },
        { label: 'Telephoto Camera', value: phone.telephoto_camera },
        { label: 'Macro Camera', value: phone.macro_camera },
        { label: 'Front Camera', value: phone.front_camera },
        { label: 'Video Recording', value: phone.video_recording },
        { label: 'OIS', value: phone.ois },
        { label: 'Camera Features', value: phone.camera_features },
      ],
    },
    {
      title: 'Battery & Charging',
      icon: 'Battery',
      rows: [
        { label: 'Battery Capacity', value: phone.battery_capacity },
        { label: 'Charging Speed', value: phone.charging_speed },
        { label: 'Wireless Charging', value: phone.wireless_charging },
        { label: 'Reverse Charging', value: phone.reverse_charging },
      ],
    },
    {
      title: 'Connectivity',
      icon: 'Wifi',
      rows: [
        { label: '5G Support', value: phone.has_5g ? 'Yes' : 'No', isBoolean: true },
        { label: 'Wi-Fi', value: phone.wifi },
        { label: 'Bluetooth', value: phone.bluetooth },
        { label: 'NFC', value: phone.has_nfc ? 'Yes' : 'No', isBoolean: true },
        { label: 'USB', value: phone.usb },
        { label: 'GPS', value: phone.gps },
        { label: 'SIM', value: phone.sim },
      ],
    },
    {
      title: 'Security',
      icon: 'Shield',
      rows: [
        { label: 'Fingerprint Sensor', value: phone.fingerprint_sensor },
        { label: 'Face Unlock', value: phone.face_unlock },
      ],
    },
    {
      title: 'Audio',
      icon: 'Volume',
      rows: [
        { label: 'Stereo Speakers', value: phone.stereo_speakers ? 'Yes' : 'No', isBoolean: true },
        { label: '3.5mm Headphone Jack', value: phone.headphone_jack ? 'Yes' : 'No', isBoolean: true },
      ],
    },
    {
      title: 'Durability',
      icon: 'Droplet',
      rows: [
        { label: 'Water Resistance', value: phone.water_resistance },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((section) => {
        const hasData = section.rows.some((r) => r.value);
        if (!hasData) return null;
        return (
          <div key={section.title} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
            <h4 className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-white">
              {section.title}
            </h4>
            <table className="w-full">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {section.rows.map((row) => {
                  if (!row.value) return null;
                  return (
                    <tr key={row.label}>
                      <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 w-2/5 align-top">{row.label}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-white">{row.value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
