import { toast } from "react-hot-toast";

export const isMember = (user) => {
  if (!user) {
    // If no user object is provided, try to get it from localStorage
    const storedUser = localStorage.getItem("sessionData");
    user = storedUser ? JSON.parse(storedUser) : {};
  }
  
  // Check if user has a role property and it's 'member'
  // or if isAdmin is explicitly set to false
  return user?.role === 'member' || 
         (user?.isAdmin !== undefined && !user.isAdmin);
};

export const checkMemberRestrictions = async (feature) => {
  // Check localStorage first
  const storedUser = localStorage.getItem("sessionData");
  const user = storedUser ? JSON.parse(storedUser) : {};
  
  // If no user data in localStorage, try to get from URL or sessionStorage
  if (!user || Object.keys(user).length === 0) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      try {
        // If there's a token in the URL, try to validate it
        const response = await fetch(`/api/validate-token?token=${token}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData.valid) {
            localStorage.setItem("sessionData", JSON.stringify(userData.user));
            return false; // Token is valid, allow the action
          }
        }
      } catch (error) {
        console.error('Token validation failed:', error);
      }
    }
  }

  // If we have a valid user and they're not a member, allow the action
  if (user && !isMember(user)) {
    return false;
  }

  // If we get here, either the user is a member or not logged in
  let message = "You need to be logged in to ";
  
  switch(feature) {
    case 'review':
      message += "submit reviews.";
      break;
    case 'favorite':
      message += "add to favorites.";
      break;
    case 'chat':
      message += "use the chat feature.";
      break;
    default:
      message += "perform this action.";
  }
  
  toast.error(message, {
    duration: 4000,
    position: 'top-center',
  });
  
  return true; // Prevent the action
};
