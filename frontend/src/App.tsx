import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { WishlistProvider } from './context/WishlistContext';
import { WishlistPage } from './pages/WishlistPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedProducts } from './components/FeaturedProducts';
import { CategoriesSection } from './components/CategoriesSection';
import { ProductDetail } from './components/ProductDetail';
import { CartSidebar } from './components/CartSidebar';
import { Checkout } from './components/Checkout';
import { AdminPanel } from './components/AdminPanel';
import { MobileMenu } from './components/MobileMenu';
import { ShopPage } from './components/ShopPage';
import { products } from './data/products';
import { Product, Category } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CategoriesPage from './pages/CategoriesPage';
import OrderConfirmation from './pages/OrderConfirmation';


function AppContent() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.id}`);
  };

  const handleCategoryClick = (_category: Category) => {
    navigate('/shop');
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  // Home page component
  function HomePage() {
    return (
      <div>
        <Hero onShopClick={() => navigate('/shop')} />
        <FeaturedProducts products={products.filter(p => p.featured)} onProductClick={handleProductClick} />
        <CategoriesSection onCategoryClick={handleCategoryClick} />
      </div>
    );
  }

  // Shop page component
  function ShopPageComponent() {
    return <ShopPage onProductClick={handleProductClick} />;
  }


  return (
    <WishlistProvider>
      <div className="min-h-screen bg-white">
        <Header 
          onCartClick={() => setIsCartOpen(true)}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onPageChange={(page: string) => navigate(`/${page}`)}
        />
        
        <main className="pb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPageComponent />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/product/:productId" element={
              selectedProduct ? (
                <ProductDetail 
                  product={selectedProduct} 
                  onBack={() => navigate(-1)}
                />
              ) : (
                <div className="min-h-screen flex items-center justify-center">
                  <p>Product not found</p>
                </div>
              )
            } />
            <Route path="/checkout" element={
              <Checkout 
                onBack={() => navigate(-1)} 
                onComplete={() => {
                  setIsCartOpen(false);
                  navigate('/order-confirmation');
                }} 
              />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <CartSidebar 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />
        
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)}
          onPageChange={(page: string) => {
            navigate(`/${page}`);
            setIsMobileMenuOpen(false);
          }}
        />
      </div>
    </WishlistProvider>
  );
};

function App() {
  return (
    <Router>
      <WishlistProvider>
        <AppContent />
      </WishlistProvider>
    </Router>
  );
}

export default App;