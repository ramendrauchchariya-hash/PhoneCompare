import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Search } from 'lucide-react';
import type { Phone } from '@/types';
import { fetchPhoneBySlug, searchPhones } from '@/services/phoneService';
import { useCompare } from '@/contexts/CompareContext';
import ComparisonTable from '@/components/phone/ComparisonTable';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';

export default function ComparePage() {
  const { phones: slugsParam } = useParams<{ phones?: string }>();
  const navigate = useNavigate();
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useCompare();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Phone[]>([]);

  const slugs = slugsParam ? slugsParam.split('-vs-') : compareList;

  useEffect(() => {
    setLoading(true);
    (async () => {
      const results: Phone[] = [];
      for (const slug of slugs) {
        if (!slug) continue;
        try {
          const phone = await fetchPhoneBySlug(slug);
          if (phone) results.push(phone);
        } catch (err) {
          console.error(`Failed to load phone ${slug}:`, err);
        }
      }
      setPhones(results);
      setLoading(false);
    })();
  }, [slugsParam, compareList.join(',')]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchPhones(searchQuery, 8);
      setSearchResults(results.filter((p) => !slugs.includes(p.slug)));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAdd = (slug: string) => {
    addToCompare(slug);
    setSearchOpen(false);
    setSearchQuery('');
    // Update URL
    const newSlugs = [...slugs, slug];
    navigate(`/compare/${newSlugs.join('-vs-')}`);
  };

  const handleRemove = (slug: string) => {
    removeFromCompare(slug);
    const newSlugs = slugs.filter((s) => s !== slug);
    if (newSlugs.length === 0) {
      navigate('/compare');
    } else {
      navigate(`/compare/${newSlugs.join('-vs-')}`);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-6" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    );
  }

  if (phones.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Compare Phones</h1>
        <EmptyState
          title="No phones to compare"
          description="Add 2 to 4 phones to compare their specifications and prices side by side."
          action={
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Phone
            </button>
          }
        />
        <CompareSearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          onAdd={handleAdd}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Compare Phones</h1>
      <ComparisonTable phones={phones} onRemove={handleRemove} onAdd={() => setSearchOpen(true)} />

      <CompareSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        onAdd={handleAdd}
      />
    </div>
  );
}

function CompareSearchModal({
  open,
  onClose,
  searchQuery,
  setSearchQuery,
  searchResults,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchResults: Phone[];
  onAdd: (slug: string) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Add Phone to Compare">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search phones to add..."
          autoFocus
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
        />
      </div>
      <div className="max-h-80 overflow-y-auto space-y-2">
        {searchResults.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            {searchQuery ? 'No phones found. Try a different search.' : 'Start typing to search for phones.'}
          </p>
        ) : (
          searchResults.map((phone) => (
            <button
              key={phone.id}
              onClick={() => onAdd(phone.slug)}
              className="flex items-center gap-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                {phone.images?.[0]?.image_url ? (
                  <img src={phone.images[0].image_url} alt={phone.name} className="w-full h-full object-contain" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">{phone.brand?.name}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{phone.name}</p>
              </div>
              <Plus className="w-4 h-4 text-blue-600 flex-shrink-0" />
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}
