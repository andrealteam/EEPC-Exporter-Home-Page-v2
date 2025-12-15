/**
 * Authentication utility functions
 */

// Check if the current path is a public route
const isPublicRoute = (path) => {
  const publicRoutes = ['/auth', '/login', '/register', '/preview/'];
  return publicRoutes.some(route => path.startsWith(route));
};

// Parse JWT token without verification (for client-side use only)
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

export const checkAuth = () => {
  try {
    // Check for token in URL first
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.memberId) {
        // Store the token in localStorage
        const userData = {
          token,
          ...payload,
          exp: payload.exp || Math.floor(Date.now() / 1000) + 3600 // Default 1 hour
        };
        localStorage.setItem('sessionData', JSON.stringify(userData));
        localStorage.setItem('isValidToken', 'true');
        
        // Clean up the URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        return true;
      }
    }

    // Check localStorage for existing session
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
  // Redirect to login page
  window.location.href = '/auth/login';
};

export const requireAuth = () => {
  const isAuthenticated = checkAuth();
  
  if (!isAuthenticated) {
    // Store the intended URL for redirecting back after login
    const currentPath = window.location.pathname + window.location.search;
    if (!currentPath.includes('/auth/')) {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    clearAuth();
    return false;
  }
  
  return true;
};

export const isEditMode = () => {
  return window.location.pathname.includes('/edit');
};

// Handle successful login
export const handleSuccessfulLogin = (userData) => {
  if (userData?.token) {
    const payload = parseJwt(userData.token);
    if (!payload) return;
    
    const userSession = {
      token: userData.token,
      ...payload,
      exp: payload.exp || Math.floor(Date.now() / 1000) + 3600
    };
    
    localStorage.setItem('sessionData', JSON.stringify(userSession));
    localStorage.setItem('isValidToken', 'true');
    
    // Redirect to the intended URL or home
    const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
    sessionStorage.removeItem('redirectAfterLogin');
    
    // Clean up the URL if it has a token
    const cleanUrl = redirectTo.split('?')[0];
    window.history.replaceState({}, document.title, cleanUrl);
    
    window.location.href = redirectTo;
  }
};
