import { createContext, useContext, useState, type ReactNode } from 'react';

interface CompareContextValue {
  compareList: string[];
  addToCompare: (slug: string) => void;
  removeFromCompare: (slug: string) => void;
  clearCompare: () => void;
  isInCompare: (slug: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);
const MAX_COMPARE = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<string[]>(() => {
    const stored = localStorage.getItem('phonecompare-compare');
    return stored ? JSON.parse(stored) : [];
  });

  const persist = (list: string[]) => {
    localStorage.setItem('phonecompare-compare', JSON.stringify(list));
    setCompareList(list);
  };

  const addToCompare = (slug: string) => {
    setCompareList((prev) => {
      if (prev.includes(slug)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, slug];
      localStorage.setItem('phonecompare-compare', JSON.stringify(next));
      return next;
    });
  };

  const removeFromCompare = (slug: string) => {
    setCompareList((prev) => {
      const next = prev.filter((s) => s !== slug);
      localStorage.setItem('phonecompare-compare', JSON.stringify(next));
      return next;
    });
  };

  const clearCompare = () => persist([]);
  const isInCompare = (slug: string) => compareList.includes(slug);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
