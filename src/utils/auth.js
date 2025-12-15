/**
 * Authentication utility functions
 */

export const checkAuth = () => {
  try {
    const stored = localStorage.getItem("sessionData");
    if (!stored) {
      clearAuth();
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
  if (!isAuthenticated) {
    clearAuth();
    // Only redirect if we're not already on the login page
    if (!window.location.pathname.includes('/auth/login')) {
      window.location.href = redirectUrl;
    }
    return false;
  }
  return true;
};

export const isEditMode = () => {
  return window.location.pathname.includes('/edit');
};
