// src/App.jsx
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
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
        <Route path="/" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/menu" element={<Menu />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;
