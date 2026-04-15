import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
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

// Componente para proteger rotas que exigem autenticação (qualquer usuário logado)
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

// Layout principal que envolve as rotas com Header, Footer e Modais globais
function AppLayout() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileFooter />
      <GlobalModals />
    </div>
  );
}

// Componente raiz da aplicação
function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Redireciona a raiz para o cardápio */}
        <Route path="/" element={<Navigate to="/menu" replace />} />
        
        {/* Login como rota separada*/}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas que utilizam o layout padrão*/}
        <Route element={<AppLayout />}>
          {/* Rotas públicas - acessíveis sem autenticação */}
          <Route path="/menu" element={<Menu />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/promotions" element={<Promotions />} />
          
          {/* Rota protegida - exige login */}
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          {/* Rotas de administrador - exigem login + role ADMIN */}
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
