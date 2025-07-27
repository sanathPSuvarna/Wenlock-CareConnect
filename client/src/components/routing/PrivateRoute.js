import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  // Get authentication state from Redux store
  const { userInfo } = useSelector((state) => state.auth);
  
  // If not logged in, redirect to login page
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  
  // If logged in, render children or Outlet
  return children || <Outlet />;
};

export default PrivateRoute;
