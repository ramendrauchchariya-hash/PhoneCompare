import type { Phone } from '@/types';

interface SpecRow {
  label: string;
  value: string | null | undefined;
}

interface SpecSection {
  title: string;
  rows: SpecRow[];
}

export default function SpecificationTable({ phone }: { phone: Phone }) {
  const sections: SpecSection[] = [
    {
      title: 'General',
      rows: [
        { label: 'Brand', value: phone.brand?.name },
        { label: 'Model', value: phone.model_number },
        { label: 'Release Date', value: phone.release_date },
        { label: 'Operating System', value: phone.os },
        { label: 'Dimensions', value: phone.dimensions },
        { label: 'Weight', value: phone.weight },
        { label: 'Colors', value: phone.colors?.map((c) => c.name).join(', ') },
      ],
    },
    {
      title: 'Display',
      rows: [
        { label: 'Display Size', value: phone.display_size },
        { label: 'Panel Type', value: phone.display_type },
        { label: 'Resolution', value: phone.resolution },
        { label: 'Refresh Rate', value: phone.refresh_rate },
        { label: 'Peak Brightness', value: phone.peak_brightness },
        { label: 'HDR', value: phone.hdr },
        { label: 'Protection', value: phone.protection },
      ],
    },
    {
      title: 'Performance',
      rows: [
        { label: 'Processor', value: phone.processor },
        { label: 'Chipset Brand', value: phone.chipset_brand },
        { label: 'CPU', value: phone.cpu },
        { label: 'GPU', value: phone.gpu },
        { label: 'RAM Options', value: phone.ram_options?.replace(/[\[\]"]/g, '').replace(/,/g, ', ') },
        { label: 'Storage Options', value: phone.storage_options?.replace(/[\[\]"]/g, '').replace(/,/g, ', ') },
        { label: 'Expandable Storage', value: phone.expandable_storage },
      ],
    },
    {
      title: 'Camera',
      rows: [
        { label: 'Main Camera', value: phone.main_camera },
        { label: 'Ultra-wide', value: phone.ultrawide_camera },
        { label: 'Telephoto', value: phone.telephoto_camera },
        { label: 'Macro', value: phone.macro_camera },
        { label: 'Front Camera', value: phone.front_camera },
        { label: 'Video Recording', value: phone.video_recording },
        { label: 'OIS', value: phone.ois },
        { label: 'Features', value: phone.camera_features },
      ],
    },
    {
      title: 'Battery',
      rows: [
        { label: 'Battery Capacity', value: phone.battery_capacity },
        { label: 'Charging Speed', value: phone.charging_speed },
        { label: 'Wireless Charging', value: phone.wireless_charging },
        { label: 'Reverse Charging', value: phone.reverse_charging },
      ],
    },
    {
      title: 'Connectivity',
      rows: [
        { label: '5G', value: phone.has_5g ? 'Yes' : 'No' },
        { label: 'Wi-Fi', value: phone.wifi },
        { label: 'Bluetooth', value: phone.bluetooth },
        { label: 'NFC', value: phone.has_nfc ? 'Yes' : 'No' },
        { label: 'USB', value: phone.usb },
        { label: 'GPS', value: phone.gps },
        { label: 'SIM', value: phone.sim },
      ],
    },
    {
      title: 'Other',
      rows: [
        { label: 'Fingerprint Sensor', value: phone.fingerprint_sensor },
        { label: 'Face Unlock', value: phone.face_unlock },
        { label: 'Water Resistance', value: phone.water_resistance },
        { label: 'Stereo Speakers', value: phone.stereo_speakers ? 'Yes' : 'No' },
        { label: '3.5mm Headphone Jack', value: phone.headphone_jack ? 'Yes' : 'No' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
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
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 w-1/3">{row.label}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{row.value}</td>
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
