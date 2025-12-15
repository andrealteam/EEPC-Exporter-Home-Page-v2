/**
 * Authentication utility functions
 */

// Check if the current path is a public route
const isPublicRoute = (path) => {
  const publicRoutes = ['/auth', '/login', '/register', '/preview/'];
  return publicRoutes.some(route => path.startsWith(route));
};

export const checkAuth = () => {
  try {
    if (isPublicRoute(window.location.pathname)) {
      return true;
    }

    const stored = localStorage.getItem("sessionData");
    if (!stored) {
      return false;
    }
    
    const customer = JSON.parse(stored);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (customer.exp && customer.exp < currentTime) {
      clearAuth();
      return false;
    }
    
    // Token is valid
    localStorage.setItem('isValidToken', 'true');
    return true;
    
  } catch (error) {
    console.error('Auth check failed:', error);
    clearAuth();
    return false;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('sessionData');
  localStorage.removeItem('isValidToken');  
};

export const requireAuth = (redirectUrl = '/auth/login') => {
  const isAuthenticated = checkAuth();
  
  // If not authenticated and not on a public route, redirect to login
  if (!isAuthenticated && !isPublicRoute(window.location.pathname)) {
    // Store the intended URL for redirecting back after login
    if (!window.location.pathname.includes('/auth/')) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    }
    clearAuth();
    window.location.href = redirectUrl;
    return false;
  }
  
  // If authenticated and trying to access auth pages, redirect to home
  if (isAuthenticated && window.location.pathname.includes('/auth/')) {
    const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = redirectTo;
    return false;
  }
  
  return isAuthenticated;
};

export const isEditMode = () => {
  return window.location.pathname.includes('/edit');
};

// Handle successful login
export const handleSuccessfulLogin = (userData) => {
  if (userData && userData.token) {
    localStorage.setItem('sessionData', JSON.stringify(userData));
    localStorage.setItem('isValidToken', 'true');
    
    // Redirect to the intended URL or home
    const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = redirectTo;
  }
};
