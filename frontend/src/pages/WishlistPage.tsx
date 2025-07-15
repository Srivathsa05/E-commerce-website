import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

export function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <span className="ml-2 text-gray-500">({items.length})</span>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                product={product}
                onProductClick={() => navigate(`/product/${product.id}`)}
              />
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm text-red-500 hover:bg-red-50"
                aria-label="Remove from wishlist"
              >
                <Heart className="h-5 w-5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love for later</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
