// Remove unused React import
import { X, Home, ShoppingBag, Grid, Info, Phone, User } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  onPageChange: (page: string) => void;
}

import { useNavigate } from 'react-router-dom';

export function MobileMenu({ isOpen, onClose, currentPage }: MobileMenuProps) {
  const navigate = useNavigate();
  const menuItems = [
    { key: 'home', label: 'Home', icon: Home, to: '/' },
    { key: 'shop', label: 'Shop', icon: ShoppingBag, to: '/shop' },
    { key: 'categories', label: 'Categories', icon: Grid, to: '/categories' },
    { key: 'about', label: 'About', icon: Info, to: '/about' },
    { key: 'contact', label: 'Contact', icon: Phone, to: '/contact' },
    { key: 'admin', label: 'Admin', icon: User, to: '/admin' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                navigate(item.to);
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                currentPage === item.key
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}