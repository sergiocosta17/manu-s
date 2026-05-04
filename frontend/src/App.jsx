import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { CartProvider, useCart } from './contexts/CartContext';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Profile from './pages/Profile';
import Promotions from './pages/Promotions';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import Header from './components/Header';
import MobileFooter from './components/MobileFooter';
import Footer from './components/Footer';
import GlobalModals from './components/GlobalModals';
import ProductPage from './pages/ProductPage';
import ConfirmModal from './components/ConfirmModal';
import ScrollToTop from './components/ScrollToTop';

// Páginas institucionais
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';

// Componente para proteger rotas que exigem autenticação
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Componente para proteger rotas exclusivas do administrador
function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 'ADMIN') {
    return <Navigate to="/menu" replace />;
  }
  
  return children;
}

// Modal de confirmação para remoção de itens do carrinho
function CartConfirmModal() {
  const { confirmModal, closeConfirmModal, confirmRemoval } = useCart();
  
  return (
    <ConfirmModal
      isOpen={confirmModal.isOpen}
      onClose={closeConfirmModal}
      onConfirm={confirmRemoval}
      title="Remover item?"
      message="Tem certeza que deseja remover este item do carrinho?"
      product={confirmModal.product}
      confirmText="Remover"
      cancelText="Manter"
    />
  );
}

// Layout principal que envolve as rotas com Header, Footer e Modais globais
function AppLayout() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-grow pt-6 pb-2 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileFooter />
      <GlobalModals />
      <CartConfirmModal />
    </div>
  );
}

// Componente raiz da aplicação
function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        
        <Route path="/login" element={<Login />} />
        
        <Route element={<AppLayout />}>

          <Route path="/menu" element={<Menu />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/promotions" element={<Promotions />} />
          
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;