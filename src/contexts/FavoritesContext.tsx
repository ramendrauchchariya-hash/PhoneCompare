import { createContext, useContext, useState, type ReactNode } from 'react';

interface FavoritesContextValue {
  favorites: string[];
  toggleFavorite: (phoneId: string) => void;
  isFavorite: (phoneId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('phonecompare-favorites');
    return stored ? JSON.parse(stored) : [];
  });

  const toggleFavorite = (phoneId: string) => {
    setFavorites((prev) => {
      let next: string[];
      if (prev.includes(phoneId)) {
        next = prev.filter((id) => id !== phoneId);
      } else {
        next = [...prev, phoneId];
      }
      localStorage.setItem('phonecompare-favorites', JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (phoneId: string) => favorites.includes(phoneId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
