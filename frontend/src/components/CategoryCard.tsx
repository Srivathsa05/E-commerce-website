import React from 'react';
import { Category } from '../types';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onCategoryClick: (category: Category) => void;
}

export function CategoryCard({ category, onCategoryClick }: CategoryCardProps) {
  return (
    <div
      onClick={() => onCategoryClick(category)}
      className="relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      <div className="relative overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
          <p className="text-white/90 text-sm mb-3">{category.productCount} products</p>
          <div className="flex items-center text-white group-hover:text-yellow-400 transition-colors">
            <span className="text-sm font-semibold">Shop Now</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}