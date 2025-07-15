import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { ordersAPI } from '../services/api';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface CartContextType extends CartState {
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: () => Promise<void>;
  saveCart: () => Promise<void>;
  createOrder: (orderData: any) => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  let newState = { ...state };
  
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItemIndex = newState.items.findIndex(item => item.product.id === action.payload.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...newState.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        newState.items = updatedItems;
      } else {
        // Add new item
        newState.items = [...newState.items, { product: action.payload, quantity: 1 }];
      }
      break;
    }
    
    case 'REMOVE_FROM_CART':
      newState.items = newState.items.filter(item => item.product.id !== action.payload);
      break;
      
    case 'UPDATE_QUANTITY':
      newState.items = newState.items.map(item =>
        item.product.id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      break;
      
    case 'CLEAR_CART':
      newState.items = [];
      break;
      
    case 'LOAD_CART':
      newState.items = action.payload;
      break;
      
    default:
      return state;
  }
  
  // Recalculate totals after any state change
  newState.total = newState.items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );
  newState.itemCount = newState.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  
  return newState;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });
  
  const { isAuthenticated, user } = useAuth();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load cart from localStorage or backend on initial render
  useEffect(() => {
    const loadCart = async () => {
      try {
        let cartItems: CartItem[] = [];
        
        // Try to load from backend if user is authenticated
        if (isAuthenticated && user) {
          try {
            // TODO: Implement getCart API endpoint in the backend
            // const { data } = await cartAPI.getCart();
            // cartItems = data.items || [];
          } catch (error) {
            console.error('Failed to load cart from server', error);
          }
        } 
        // Fallback to localStorage
        else {
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              cartItems = JSON.parse(savedCart);
            } catch (error) {
              console.error('Failed to parse cart from localStorage', error);
              localStorage.removeItem('cart');
            }
          }
        }
        
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadCart();
  }, [isAuthenticated, user]);

  // Save cart to localStorage or backend when it changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const saveCart = async () => {
      try {
        // Save to backend if user is authenticated
        if (isAuthenticated) {
          // TODO: Implement saveCart API endpoint in the backend
          // await cartAPI.saveCart(state.items);
        } 
        // Fallback to localStorage
        else {
          if (state.items.length > 0) {
            localStorage.setItem('cart', JSON.stringify(state.items));
          } else {
            localStorage.removeItem('cart');
          }
        }
      } catch (error) {
        console.error('Error saving cart', error);
      }
    };
    
    saveCart();
  }, [state.items, isAuthenticated, isInitialized]);

  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  const loadCart = async () => {
    try {
      // TODO: Implement getCart API endpoint in the backend
      // const { data } = await cartAPI.getCart();
      // dispatch({ type: 'LOAD_CART', payload: data.items || [] });
    } catch (error) {
      console.error('Error loading cart', error);
      throw error;
    }
  };
  
  const saveCart = async () => {
    try {
      // TODO: Implement saveCart API endpoint in the backend
      // await cartAPI.saveCart(state.items);
    } catch (error) {
      console.error('Error saving cart', error);
      throw error;
    }
  };
  
  const createOrder = async (orderData: any) => {
    try {
      const order = {
        orderItems: state.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          image: item.product.image,
          price: item.product.price,
          product: item.product.id
        })),
        ...orderData,
        itemsPrice: state.total,
        taxPrice: state.total * 0.1, // 10% tax
        shippingPrice: state.total > 100 ? 0 : 10, // $10 shipping if order < $100
        totalPrice: state.total * 1.1 + (state.total > 100 ? 0 : 10) // total + tax + shipping
      };
      
      const { data } = await ordersAPI.createOrder(order);
      
      // Clear cart after successful order
      if (data.success) {
        clearCart();
      }
      
      return data;
    } catch (error) {
      console.error('Error creating order', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loadCart,
        saveCart,
        createOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}