import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { Filter, Search, X, Heart } from 'lucide-react';
import { productsAPI, Product as APIProduct } from '../services/api';
import { useWishlist } from '../context/WishlistContext';

// Extend the API Product type with any additional fields we need
type LocalProduct = Omit<APIProduct, 'images' | 'id'> & {
  id: string;
  image: string; // Single image URL
  images: string[]; // Array of additional images
  originalPrice?: number; // Optional original price for sales
  seller: string;
  stock: number;
  features: string[];
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
};

// CombinedProduct is now just an alias for LocalProduct
type CombinedProduct = LocalProduct;

import { Product } from '../types';

interface ShopPageProps {
  onProductClick: (product: Product) => void;
}

// Number of products to load per page
const PRODUCTS_PER_PAGE = 12;

export function ShopPage({ onProductClick }: ShopPageProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState<CombinedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [sortBy, setSortBy] = useState('name');
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialLoad, setInitialLoad] = useState(true);

  // Memoize the product mapping function to prevent unnecessary re-renders
  const mapApiProductToLocal = (product: APIProduct): CombinedProduct | null => {
    try {
      // Use _id from the API response if available, otherwise use id
      const productId = (product as any)._id || product.id;
      
      if (!productId) {
        console.warn('Product is missing ID:', product);
        return null;
      }
      
      // Ensure images is always an array
      const images = Array.isArray((product as any).images) 
        ? (product as any).images 
        : [];
      
      // Get the first image as the main image
      const image = (product as any).image || images[0] || '';
      
      // Create the base product with required fields
      const mappedProduct: LocalProduct = {
        ...product,
        // Map _id to id for consistency
        id: productId,
        // Set the main image
        image: image,
        // Ensure images is always an array
        images: images,
        // Ensure features is always an array of strings
        features: Array.isArray(product.features) 
          ? product.features 
          : (product.features ? [String(product.features)] : []),
        // Set default values for optional fields
        rating: product.rating ?? 0,
        reviews: product.reviews ?? 0,
        featured: product.featured ?? false,
        inStock: product.inStock ?? true,
        // Ensure all required fields have defaults
        name: product.name || 'Unnamed Product',
        price: product.price || 0,
        category: product.category || 'Uncategorized',
        seller: (product as any).seller || 'Unknown Seller',
        stock: (product as any).stock || 0,
        description: product.description || ''
      };
      
      return mappedProduct;
    } catch (error) {
      console.error('Error mapping product:', error, product);
      return null;
    }
  };

  // Fetch products with pagination
  const fetchProducts = useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true);
      const { data } = await productsAPI.getProducts();
      
      // Map API products to our local format
      const mappedProducts = data.products
        .map(mapApiProductToLocal)
        .filter((product): product is CombinedProduct => product !== null);
      
      if (reset) {
        setProducts(mappedProducts);
      } else {
        setProducts(prev => [...prev, ...mappedProducts]);
      }
      
      // Check if there are more products to load
      setHasMore(mappedProducts.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    if (initialLoad) {
      fetchProducts(1, true);
    }
  }, [fetchProducts, initialLoad]);
  
  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 500 && 
        !loading && 
        hasMore
      ) {
        setPage(prev => prev + 1);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);
  
  // Load more products when page changes
  useEffect(() => {
    if (page > 1) {
      fetchProducts(page);
    }
  }, [page, fetchProducts]);

  // Predefined categories (always show these)
  const predefinedCategories = [
    'Electronics',
    'Clothing',
    'Home & Kitchen',
    'Books',
    'Sports',
    'Beauty',
  ];
  // Combine predefined with product categories
  const categories = useMemo(() => {
    const productCategories = products.map(p => p.category).filter(Boolean);
    const uniqueCategories = Array.from(new Set([...predefinedCategories, ...productCategories]));
    return ['All', ...uniqueCategories];
  }, [products]);

  // Function to handle category selection
  const handleCategoryChange = (category: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', category);
    }
    setSearchParams(newSearchParams);
  };

  // Get the current category from URL
  const currentCategory = searchParams.get('category') || 'All';

  // (Removed cleanup useEffect that cleared category param on unmount)
  // This was causing navigation issues and should not be present.

  // Memoize filtered products to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch = searchTerm === '' || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = currentCategory === 'All' || product.category === currentCategory;
        
        let matchesPrice = true;
        if (priceRange) {
          const price = product.price;
          switch (priceRange) {
            case 'under-500': matchesPrice = price < 500; break;
            case '500-1000': matchesPrice = price >= 500 && price <= 1000; break;
            case '1000-2000': matchesPrice = price >= 1000 && price <= 2000; break;
            case 'over-2000': matchesPrice = price > 2000; break;
          }
        }
        
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low': return a.price - b.price;
          case 'price-high': return b.price - a.price;
          case 'rating': return (b.rating || 0) - (a.rating || 0);
          default: return a.name.localeCompare(b.name);
        }
      });
  }, [products, searchTerm, currentCategory, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
              <p className="text-gray-600">Discover our complete collection of premium products</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <select
                value={currentCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {currentCategory !== 'All' && (
                <button
                  onClick={() => handleCategoryChange('All')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Prices</option>
              <option value="under-500">Under 500</option>
              <option value="500-1000">500 - 1000</option>
              <option value="1000-2000">1000 - 2000</option>
              <option value="over-2000">Over 2000</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => window.location.pathname !== '/checkout' && window.location.assign('/checkout')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
          >
            Go to Checkout
          </button>
        </div>
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product: CombinedProduct) => {
              const wishlisted = isInWishlist(product.id);
              return (
                <div key={product.id} className="relative group">
                  <ProductCard
                    product={product as Product}
                    onProductClick={() => onProductClick(product as Product)}
                  />
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      wishlisted ? removeFromWishlist(product.id) : addToWishlist(product as Product);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full ${wishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} bg-white/80 backdrop-blur-sm`}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                {loading ? 'Loading products...' : 'No products found matching your criteria.'}
              </p>
            </div>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}