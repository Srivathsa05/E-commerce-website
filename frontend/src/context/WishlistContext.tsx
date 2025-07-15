import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Product } from '../types';

interface WishlistState {
  items: Product[];
}

type WishlistAction =
  | { type: 'ADD'; product: Product }
  | { type: 'REMOVE'; productId: string }
  | { type: 'CLEAR' };

const WishlistContext = createContext<{
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
} | undefined>(undefined);

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD':
      if (state.items.find((item) => item.id === action.product.id)) return state;
      return { ...state, items: [...state.items, action.product] };
    case 'REMOVE':
      return { ...state, items: state.items.filter((item) => item.id !== action.productId) };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  const addToWishlist = useCallback((product: Product) => {
    dispatch({ type: 'ADD', product });
  }, []);
  const removeFromWishlist = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE', productId });
  }, []);
  const isInWishlist = useCallback((productId: string) => {
    return state.items.some((item) => item.id === productId);
  }, [state.items]);
  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items: state.items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
