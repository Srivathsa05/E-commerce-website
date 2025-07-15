import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, ShoppingCart, Users, AlertCircle } from 'lucide-react';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Types
interface APIProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  seller: string;
  stock: number;
  images?: string[];
  image?: string;
  description: string;
  features: string[] | string;
  inStock?: boolean;
  featured?: boolean;
  rating?: number;
  reviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  name: string;
  price: string;
  category: string;
  seller: string;
  stock: string;
  image: string; // First/main image
  images: string; // Comma-separated additional images
  description: string;
  features: string;
  inStock: boolean;
  featured: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  seller: string;
  stock: number;
  image: string; // First/main image
  images?: string[]; // Additional images
  description: string;
  features: string[] | string; // Can be array or string
  inStock: boolean;
  featured: boolean;
  rating?: number;
  reviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function AdminPanel() {
  const { isAdmin, isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    category: '',
    seller: user?.name || '',
    stock: '1',
    image: '',
    images: '',
    description: '',
    features: '',
    inStock: true,
    featured: false
  });

// Allowed categories from backend
const allowedCategories = [
  'Electronics', 'Cameras', 'Laptops', 'Accessories', 'Headphones', 'Food',
  'Books', 'Clothes/Shoes', 'Beauty/Health', 'Sports', 'Outdoor', 'Home'
];

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (!isAdmin) {
        setError('You do not have permission to access this page');
      } else {
        const fetchProducts = async () => {
          try {
            setLoading(true);
            const { data } = await productsAPI.getProducts();
            // Map API products to our local Product type
            const mappedProducts = data.products.map((apiProduct: APIProduct) => {
              // Create a new product object with required fields
              const product: Product = {
                id: apiProduct.id,
                name: apiProduct.name,
                price: apiProduct.price,
                category: apiProduct.category,
                seller: apiProduct.seller || '',
                stock: apiProduct.stock || 0,
                // Use the image field or first image from images array
                image: apiProduct.image || (apiProduct.images && apiProduct.images.length > 0 ? apiProduct.images[0] : ''),
                // Include images array if it exists
                images: apiProduct.images || [],
                // Ensure features is always an array
                features: Array.isArray(apiProduct.features) 
                  ? apiProduct.features 
                  : (typeof apiProduct.features === 'string' 
                      ? apiProduct.features.split(',').map(f => f.trim())
                      : []),
                inStock: apiProduct.inStock !== undefined ? apiProduct.inStock : true,
                featured: apiProduct.featured || false,
                description: apiProduct.description || '',
                // Optional fields
                rating: apiProduct.rating,
                reviews: apiProduct.reviews,
                createdAt: apiProduct.createdAt,
                updatedAt: apiProduct.updatedAt
              };
              return product;
            });
            setProducts(mappedProducts);
          } catch (error: any) {
            console.error('Error fetching products:', error);
            if (error.response && error.response.status === 401) {
              // Token might be expired or invalid
              localStorage.removeItem('token');
              navigate('/login');
            } else {
              setError('Failed to load products. Please try again.');
            }
          } finally {
            setLoading(false);
          }
        };
        fetchProducts();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    // Validate all required fields
    if (!formData.name || !formData.price || !formData.category || !formData.seller || !formData.stock || !formData.description || !formData.image) {
      setError('Please fill all required fields including the image path.');
      setLoading(false);
      return;
    }
    if (!allowedCategories.includes(formData.category)) {
      setError('Please select a valid category.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Prepare JSON payload with images array
      const additionalImages = formData.images 
        ? formData.images.split(',').map(img => img.trim()).filter(img => img)
        : [];
      
      const payload: Omit<APIProduct, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviews'> = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        seller: formData.seller,
        stock: parseInt(formData.stock, 10),
        image: formData.image,
        images: [formData.image, ...additionalImages].filter(Boolean), // Include main image and additional images
        description: formData.description,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        inStock: formData.inStock,
        featured: formData.featured
      };
      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, payload);
      } else {
        await productsAPI.createProduct(payload);
      }
      // Refresh products list
      const { data } = await productsAPI.getProducts();
      setProducts(data.products.map((product: APIProduct) => ({
        ...product,
        // Ensure all required fields are present with proper defaults
        seller: product.seller || '',
        stock: product.stock || 0,
        // Handle image field
        image: product.image || (product.images && product.images.length > 0 ? product.images[0] : ''),
        // Ensure features is always an array
        features: Array.isArray(product.features) 
          ? product.features 
          : (typeof product.features === 'string' 
              ? product.features.split(',').map(f => f.trim())
              : []),
        inStock: product.inStock !== undefined ? product.inStock : true,
        featured: product.featured || false,
        description: product.description || ''
      } as Product)));
      // Reset form
      setFormData({
        name: '',
        price: '',
        category: '',
        seller: user?.name || '',
        stock: '1',
        image: '',
        images: '',
        description: '',
        features: '',
        inStock: true,
        featured: false
      });
      setShowAddForm(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Error saving product:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to save product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      seller: product.seller || '',
      stock: product.stock ? product.stock.toString() : '1',
      image: product.image || '',
      images: product.images ? product.images.join(', ') : '',
      description: product.description || '',
      features: Array.isArray(product.features) ? product.features.join(', ') : product.features || '',
      inStock: product.inStock,
      featured: product.featured
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await productsAPI.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (error: any) {
        console.error('Error deleting product:', error);
        setError(error.response?.data?.message || 'Failed to delete product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const stats = [
    { 
      name: 'Total Products', 
      value: products?.length || 0, 
      icon: Package, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Featured Products', 
      value: products?.filter(p => p.featured).length || 0, 
      icon: ShoppingCart, 
      color: 'bg-green-500' 
    },
    { 
      name: 'In Stock', 
      value: products?.filter(p => p.inStock).length || 0, 
      icon: Users, 
      color: 'bg-purple-500' 
    }
  ] as const;

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seller</label>
                  <input
                    type="text"
                    name="seller"
                    value={formData.seller}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Main Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    id="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., product1.jpg"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Image Preview:</p>
                      <img 
                        src={`/images/product-images/${formData.image}`} 
                        alt="Preview" 
                        className="mt-1 h-32 w-32 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                    Additional Images (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="images"
                    id="images"
                    value={formData.images}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., product2.jpg, product3.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter additional image filenames separated by commas. All images should be in /images/product images/
                  </p>
                  {formData.images && (
  <div className="mt-2">
    <p className="text-sm text-gray-500">Additional Images:</p>
    <div className="flex flex-wrap gap-2 mt-1">
      {formData.images.split(',').map((img, index) => {
        const imgSrc = img.trim();
        if (!imgSrc) return null;
        return (
          <img
            key={index}
            src={`/images/product-images/${imgSrc}`.replace(/\s+/g, '%20')}
            alt={`Preview ${index + 1}`}
            className="h-16 w-16 object-cover rounded border border-gray-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder-product.jpg';
            }}
          />
        );
      })}
    </div>
  </div>
)}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="features" className="block text-sm font-medium text-gray-700">
                    Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="features"
                    id="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Feature 1, Feature 2, Feature 3"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="inStock"
                    name="inStock"
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
                    In Stock
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Featured Product
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      price: '',
                      category: '',
                      seller: user?.name || '',
                      stock: '1',
                      image: '',
                      images: '',
                      description: '',
                      features: '',
                      inStock: true,
                      featured: false
                    });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Products</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Price
</th>
<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Status
</th>
<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
  Actions
</th>
</tr>
</thead>
<tbody className="bg-white divide-y divide-gray-200">
  {products.map((product,index) => (
    <tr key={index}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img 
              className="h-10 w-10 rounded-full object-cover" 
              src={product.image || (product.images && product.images[0]) || ''} 
              alt={product.name} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-product.jpg';
              }}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">{Array.isArray(product.features) ? product.features.length : 0} features</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{product.category}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">₹{product.price.toFixed(2)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {product.inStock ? (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            In Stock
          </span>
        ) : (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Out of Stock
          </span>
        )}
        {product.featured && (
          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Featured
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => handleEdit(product)}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleDelete(product.id)}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
