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
import GlobalModals from './components/GlobalModals';
import ProductPage from './pages/ProductPage';

// Componente para proteger rotas que exigem autenticação
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Componente para proteger rotas de admin
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

function AppLayout() {
  return (
    <div className="relative">
      <Header />
      <main className="pt-20 pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileFooter />
      <GlobalModals />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Redireciona a raiz para o menu */}
        <Route path="/" element={<Navigate to="/menu" replace />} />
        
        {/* Login como rota separada */}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas com layout (Header, Footer, etc.) */}
        <Route element={<AppLayout />}>
          {/* Rotas públicas - qualquer um pode ver */}
          <Route path="/menu" element={<Menu />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/promotions" element={<Promotions />} />
          
          {/* Rotas protegidas - exigem login */}
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          {/* Rotas de admin - exigem login + role ADMIN */}
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
