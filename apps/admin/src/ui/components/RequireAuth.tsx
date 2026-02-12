import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import http from '../../lib/request';
import { Spin } from 'antd';

export const RequireAuth: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use better-auth's get-session endpoint
        // It returns { session, user } if authenticated.
        const res = await http.get('/api/auth/get-session');
        
        // Check if we have a valid session
        if (res && (res.session || res.user)) {
            // Optionally check role here if we want to enforce admin on client-side too
            // const user = res.user;
            // if (user?.role === 'admin') ...
            setAuthenticated(true);
        } else {
            setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Checking authentication..." />
      </div>
    );
  }

  if (!authenticated) {
    // Redirect to login page, but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
