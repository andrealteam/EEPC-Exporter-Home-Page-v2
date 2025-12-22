// Cookie utility functions
export const setCookie = (name, value, days = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;Secure`;
};

export const getCookie = (name) => {
  // Handle server-side rendering
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const removeCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Member cookie specific functions
export const MEMBER_COOKIE = 'eepc_member';

export const setMemberCookie = (memberId) => {
  if (memberId) {
    setCookie(MEMBER_COOKIE, memberId.toString(), 30); // 30 days expiry
  }
};

export const getMemberIdFromCookie = () => {
  return getCookie(MEMBER_COOKIE);
};

export const clearMemberCookie = () => {
  removeCookie(MEMBER_COOKIE);
};
