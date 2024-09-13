// import { Outlet, Navigate } from 'react-router-dom';

// import { checkAuthToken } from './TokenUtil';
// import React, { useState, useEffect, useCallback } from 'react';

// function PrivateRoute({ children, ...rest }) {
//   var isAuthenticated = checkAuthToken();
//   //isAuthenticated = true;
//   return isAuthenticated ? <Outlet /> : (window.location.href = '/');
// }

// export default PrivateRoute;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAuthToken } from './TokenUtil';

function PrivateRoute({ children }) {
  const isAuthenticated = checkAuthToken();
  const location = useLocation();

  if (!isAuthenticated) {
    // 使用 Navigate 组件重定向，通过 state 传递当前位置，方便登录后可以返回
    // return <Navigate to="/" state={{ from: location }} replace />;

    console.log('User is not authenticated, redirecting to /vendorsAccount');
    // return <Navigate to="/vendorsAccount" state={{ from: location }} replace />;
    return <Navigate to="/" state={{ from: location }} replace />; //配合修改根路徑
  }

  return children; // 如果验证通过，则渲染子组件
}

export default PrivateRoute;
