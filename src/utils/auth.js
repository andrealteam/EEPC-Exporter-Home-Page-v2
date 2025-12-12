/**
 * Manages preview tokens in localStorage
 */

export const storeActiveToken = (token) => {
  try {
    const activeTokens = JSON.parse(localStorage.getItem('activePreviewTokens') || '{}');
    activeTokens[token] = true;
    localStorage.setItem('activePreviewTokens', JSON.stringify(activeTokens));
  } catch (error) {
    console.error('Error storing active token:', error);
  }
};

export const isTokenActive = (token) => {
  try {
    const activeTokens = JSON.parse(localStorage.getItem('activePreviewTokens') || '{}');
    return !!activeTokens[token];
  } catch (error) {
    console.error('Error checking active tokens:', error);
    return false;
  }
};

export const clearAllPreviewTokens = () => {
  try {
    localStorage.removeItem('activePreviewTokens');
  } catch (error) {
    console.error('Error clearing preview tokens:', error);
  }
};

export const logoutUser = () => {
  // Clear session data
  localStorage.removeItem('sessionData');
  // Clear all preview tokens
  clearAllPreviewTokens();
  
  // Notify other tabs about logout
  const logoutEvent = new StorageEvent('storage', {
    key: 'sessionData',
    newValue: null
  });
  window.dispatchEvent(logoutEvent);
  
  // Redirect to login
  window.location.href = 'https://eepc-exporter-home-page-v2.vercel.app/auth/login';
};
