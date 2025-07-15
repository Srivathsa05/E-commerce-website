import React, { createContext, useContext, useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

type Product = {
  _id: string;
  name: string;
  image: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  countInStock: number;
  rating: number;
  numReviews: number;
};

type ProductContextType = {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (product: Omit<Product, '_id' | 'rating' | 'numReviews'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createReview: (productId: string, review: { rating: number; comment: string }) => Promise<void>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productsAPI.getProducts();
      setProducts(data.products);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const { data } = await productsAPI.getProduct(id);
      setProduct(data.product);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching product');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, '_id' | 'rating' | 'numReviews'>) => {
    try {
      setLoading(true);
      const { data } = await productsAPI.createProduct(productData);
      setProducts([...products, data.product]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      setLoading(true);
      const { data } = await productsAPI.updateProduct(id, productData);
      setProducts(products.map(p => p._id === id ? data.product : p));
      if (product && product._id === id) {
        setProduct(data.product);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await productsAPI.deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
      if (product && product._id === id) {
        setProduct(null);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (productId: string, review: { rating: number; comment: string }) => {
    try {
      setLoading(true);
      await productsAPI.createReview(productId, review);
      // Refresh the product to get the updated reviews
      await fetchProduct(productId);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of products
  useEffect(() => {
    fetchProducts();
  }, []);

  const value = {
    products,
    product,
    loading,
    error,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    createReview,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
