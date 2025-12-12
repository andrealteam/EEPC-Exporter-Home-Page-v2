import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './auth';
import {
  Draft,
  Live,
  PageNotFound,
  Register,
  Review,
  Section,
  Unauthorized,
  Verify,
} from "../pages";
import FinalReview from "../pages/FinalReview";
import Login from "../pages/Login";
import Preview from "../pages/Preview";
import NotFound from "../pages/NotFound";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuth = isAuthenticated();

  if (!isAuth) {
    // Redirect to 404 page if not authenticated
    return <Navigate to="/404" state={{ from: location }} replace />;
  }

  return children;
};

const routes = [
  // Public routes
  { 
    path: "/auth", 
    element: <Login /> 
  },
  { 
    path: "/", 
    element: <Verify /> 
  },
  { 
    path: "/register", 
    element: <Register /> 
  },
  { 
    path: "/preview/:token", 
    element: <Preview /> 
  },
  { 
    path: "/:website_url", 
    element: <Live /> 
  },
  
  // Protected routes
  { 
    path: "/sections", 
    element: (
      <ProtectedRoute>
        <Section />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/review", 
    element: (
      <ProtectedRoute>
        <Review />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/final-review", 
    element: (
      <ProtectedRoute>
        <FinalReview />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/edit", 
    element: (
      <ProtectedRoute>
        <Draft />
      </ProtectedRoute>
    ) 
  },
  
  // Error pages
  { 
    path: "/unauthorized", 
    element: <Unauthorized /> 
  },
  { 
    path: "/404", 
    element: <NotFound /> 
  },
  { 
    path: "/*", 
    element: <PageNotFound /> 
  },
];

export default routes;
