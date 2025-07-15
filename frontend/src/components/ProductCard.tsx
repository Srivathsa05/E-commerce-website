import React, { useState, useMemo, useCallback } from 'react';
import { ShoppingCart, Heart, Star, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Memoize the image URL to prevent unnecessary recalculations
  const imageUrl = useMemo(() => {
    try {
     
      if (product.image) {
        return `/images/product-images/${product.image}`;
      }
      
    
      if (product.images?.[0]) {
        return `/images/product-images/${product.images[0]}`;
      }
    } catch (error) {
      console.error('Error processing image URL:', error);
    }
    
    // Fallback to placeholder
    return '/images/placeholder-product.jpg';
  }, [product.image, product.images]);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <div
      onClick={() => onProductClick(product)}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '1/1' }}>
        {/* Image placeholder */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-400 animate-pulse" />
          </div>
        )}
        
        {/* Actual image */}
        <img
          src={imageError ? '/images/placeholder-product.jpg' : imageUrl}
          alt={product.name}
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={`w-full h-full object-cover transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            aspectRatio: '1/1',
            maxHeight: '300px',
            objectFit: 'cover'
          }}
        />
        {product.originalPrice && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Sale
          </div>
        )}
        <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
          <Heart className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
            <span className="ml-1 text-sm text-gray-400">({product.reviews})</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 group"
          >
            <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}