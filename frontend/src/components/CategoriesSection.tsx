import { useEffect, useState } from 'react';
import { CategoryCard } from './CategoryCard';
import { Category } from '../types';
import { productsAPI } from '../services/api';

// Import category images
import electronicsImg from '../images/categories/electronics.avif';
import clothingImg from '../images/categories/clothing.jpg';
import booksImg from '../images/categories/books.jpg';
import homeImg from '../images/categories/home and kitchen.jpg';
import sportsImg from '../images/categories/sports.jpg';
import beautyImg from '../images/categories/beauty.jpg';

// Predefined list of categories with their images
const PREDEFINED_CATEGORIES: Omit<Category, 'productCount'>[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    image: electronicsImg,
  },
  {
    id: 'clothing',
    name: 'Clothing',
    slug: 'clothing',
    image: clothingImg,
  },
  {
    id: 'books',
    name: 'Books',
    slug: 'books',
    image: booksImg,
  },
  {
    id: 'home',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    image: homeImg,
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    image: sportsImg,
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    image: beautyImg,
  },
];

interface CategoriesSectionProps {
  onCategoryClick: (category: Category) => void;
}

export function CategoriesSection({ onCategoryClick }: CategoriesSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // First, set the predefined categories with 0 products
        const initialCategories = PREDEFINED_CATEGORIES.map(category => ({
          ...category,
          productCount: 0
        }));

        // Then fetch the actual products to update the counts
        const { data } = await productsAPI.getProducts();
        const products = data.products || [];
        
        // Count products in each category
        const categoryCounts = products.reduce((acc: Record<string, number>, product: { category?: string }) => {
          const categoryName = product.category || 'Uncategorized';
          acc[categoryName] = (acc[categoryName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Update the categories with the actual counts
        const updatedCategories = initialCategories.map(category => {
          const count = categoryCounts[category.name] || 0;
          return {
            ...category,
            productCount: count
          };
        });

        // Add any categories that exist in the products but not in our predefined list
        Object.entries(categoryCounts).forEach(([name, count]) => {
          if (!updatedCategories.some(cat => cat.name === name)) {
            updatedCategories.push({
              id: name.toLowerCase().replace(/\s+/g, '-'),
              name,
              slug: name.toLowerCase().replace(/\s+/g, '-'),
              image: '/images/categories/default.jpg',
              productCount: count,
            });
          }
        });

        setCategories(updatedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // If there's an error, just use the predefined categories with 0 products
        setCategories(PREDEFINED_CATEGORIES.map(category => ({
          ...category,
          productCount: 0
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our diverse range of categories and find exactly what you're looking for
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onCategoryClick={onCategoryClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}