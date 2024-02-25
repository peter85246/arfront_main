import {
    Outlet,
    Navigate
} from 'react-router-dom';

import { checkAuthToken } from './TokenUtil';
import React, { useState, useEffect, useCallback } from 'react';

function PrivateRoute({ children, ...rest }) {
    var isAuthenticated = checkAuthToken();
    //isAuthenticated = true;
    return isAuthenticated ? <Outlet /> : window.location.href = "/"
}

export default PrivateRoute;