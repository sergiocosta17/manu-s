import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Profile from './pages/Profile';
import Promotions from './pages/Promotions';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/promotions" element={<Promotions />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
    </Routes>
  );
}

export default App;