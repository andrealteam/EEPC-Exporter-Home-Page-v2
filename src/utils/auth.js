// Utility functions for authentication

export const logout = () => {
  // Clear all authentication related data
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear all cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
  
  // Force a hard redirect to 404 page
  window.location.href = "/404";
  
  // Force a full page reload to ensure all state is cleared
  window.location.reload();
};

export const isAuthenticated = () => {
  // Check if user is authenticated by checking for a valid token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};
