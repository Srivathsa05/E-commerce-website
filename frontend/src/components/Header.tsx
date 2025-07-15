import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

interface HeaderProps {
  onCartClick: () => void;
  onMenuClick: () => void;
  currentPage?: string;
  onPageChange: (page: string) => void;
}

export function Header({ onCartClick, onMenuClick, currentPage, onPageChange }: HeaderProps) {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If already on /shop, just update the query param
      if (window.location.pathname === '/shop') {
        navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      }
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
              <h1 
                className="text-2xl font-bold text-gray-900 cursor-pointer"
                onClick={() => navigate('/')}
              >
                Elite Store
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {['home', 'shop', 'categories', 'about', 'contact'].map((page) => {
              let to = '/';
              if (page === 'shop') to = '/shop';
              else if (page === 'categories') to = '/categories';
              else if (page === 'about') to = '/about';
              else if (page === 'contact') to = '/contact';
              else if (page === 'home') to = '/';
              return (
                <button
                  key={page}
                  onClick={() => navigate(to)}
                  className={`text-sm font-medium transition-colors capitalize ${
                    currentPage === page 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search products..."
              />
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isSearchOpen ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
            </button>

            {/* Wishlist */}
            <button 
              onClick={() => navigate('/wishlist')}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
            {/* User Login/Menu */}
            <div className="relative">
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex items-center"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
              >
                <User className="h-6 w-6" />
                {user && <span className="ml-2 text-sm">{user.name}</span>}
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                      {user?.role === 'admin' && (
  <button
    onClick={() => { navigate('/admin'); setIsUserMenuOpen(false); }}
    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
  >
    Admin Dashboard
  </button>
)}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onPageChange('login')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => onPageChange('register')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="relative">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button type="submit" className="sr-only">Search</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}