import { checkAuth } from "./auth";

// Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import Verify from "../pages/Verify";
import Draft from "../pages/Draft";
import Live from "../pages/Live";
import Review from "../pages/Review";
import Section from "../pages/Section";
import Preview from "../pages/Preview";
import FinalReview from "../pages/FinalReview";
import Unauthorized from "../pages/Unauthorized";
import PageNotFound from "../pages/PageNotFound";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = checkAuth();
  
  if (!isAuthenticated) {
    // Store the intended URL before redirecting to login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = '/auth/login';
    return null;
  }
  
  return children;
};

// Define routes array
export const routes = [
  // Public routes
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/preview/:token",
    element: <Preview />,
  },
  {
    path: "/:website_url",
    element: <Live />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  
  // Protected routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Verify />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sections",
    element: (
      <ProtectedRoute>
        <Section />
      </ProtectedRoute>
    ),
  },
  {
    path: "/review",
    element: (
      <ProtectedRoute>
        <Review />
      </ProtectedRoute>
    ),
  },
  {
    path: "/final-review",
    element: (
      <ProtectedRoute>
        <FinalReview />
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit",
    element: (
      <ProtectedRoute>
        <Draft />
      </ProtectedRoute>
    ),
  },
  
  // 404 - Keep this last
  {
    path: "*",
    element: <PageNotFound />,
  },
];

export default routes;
