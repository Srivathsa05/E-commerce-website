import { ProductCard } from './ProductCard';
import { Product } from '../types';

interface FeaturedProductsProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function FeaturedProducts({ products, onProductClick }: FeaturedProductsProps) {
  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium products that define quality and style
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={() => onProductClick(product)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}