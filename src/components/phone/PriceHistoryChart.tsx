import { useMemo } from 'react';
import type { PriceHistory } from '@/types';
import { formatPrice } from '@/utils/format';

interface PriceHistoryChartProps {
  data: PriceHistory[];
  range?: '7d' | '30d' | '3m' | '6m' | '1y';
}

const numPrice = (v: number | string) => typeof v === 'number' ? v : parseFloat(String(v)) || 0;

export default function PriceHistoryChart({ data, range = '30d' }: PriceHistoryChartProps) {
  const filtered = useMemo(() => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '3m' ? 90 : range === '6m' ? 180 : 365;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return data.filter((d) => new Date(d.recorded_at) >= cutoff);
  }, [data, range]);

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">No price history available for this period.</p>
      </div>
    );
  }

  const prices = filtered.map((d) => numPrice(d.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const rangeVal = max - min || 1;
  const width = 100;
  const height = 200;

  const points = filtered.map((d, i) => {
    const x = (i / (filtered.length - 1 || 1)) * width;
    const y = height - ((numPrice(d.price) - min) / rangeVal) * (height - 20) - 10;
    return { x, y, price: numPrice(d.price), date: d.recorded_at, store: d.store?.name };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const storeNames = [...new Set(filtered.map((d) => d.store?.name).filter(Boolean))];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="text-xs text-gray-400">Lowest</p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatPrice(min)}</p>
        </div>
        {storeNames.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-gray-400">Stores</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{storeNames.join(', ')}</p>
          </div>
        )}
        <div className="text-right">
          <p className="text-xs text-gray-400">Highest</p>
          <p className="text-sm font-bold text-red-500">{formatPrice(max)}</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height: '200px' }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#priceGradient)" />
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#3b82f6" />
        ))}
      </svg>

      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>{new Date(filtered[0].recorded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        <span>{new Date(filtered[filtered.length - 1].recorded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </div>

      {filtered.length > 1 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Price</th>
                <th className="py-2 font-medium hidden sm:table-cell">Store</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {[...filtered].reverse().slice(0, 10).map((d) => (
                <tr key={d.id}>
                  <td className="py-2 text-gray-500 dark:text-gray-400">
                    {new Date(d.recorded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-2 font-medium text-gray-900 dark:text-white">{formatPrice(numPrice(d.price))}</td>
                  <td className="py-2 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{d.store?.name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
