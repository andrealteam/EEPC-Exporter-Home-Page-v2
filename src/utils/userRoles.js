import { toast } from "react-hot-toast";

export const isMember = (user) => {
  // Assuming the user object has a role property
  // If not, you might need to adjust this based on your actual user object structure
  return user?.role === 'member' || !user?.isAdmin;
};

export const checkMemberRestrictions = (feature) => {
  const user = JSON.parse(localStorage.getItem("sessionData")) || {};
  
  if (isMember(user)) {
    let message = "You are not eligible to ";
    
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
    
    return true; // Indicates the action should be prevented
  }
  
  return false; // Action is allowed
};
