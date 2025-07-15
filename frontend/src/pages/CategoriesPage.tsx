import { categories } from '../data/products';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-white p-6 rounded shadow text-center text-lg font-medium">
              {cat.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
