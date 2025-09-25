import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const adminData = localStorage.getItem('adminData');

  if (!token || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const admin = JSON.parse(adminData);
    
    if (admin.role !== 'admin' && admin.role !== 'super_admin') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return ;
    }

    return children;
  } catch {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    return ;
  }
};

export default ProtectedAdminRoute;