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
import Logout from "../components/auth/Logout";
import { ProtectedRoute, PublicRoute } from "../components/common/ProtectedRoute";

const routes = [
  // Public routes
  {
    path: "/auth",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  
  // Protected routes
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
  
  // Public pages that don't require authentication
  { 
    path: "/", 
    element: <Verify /> 
  },
  { 
    path: "/preview/:token", 
    element: <Preview /> 
  },
  { 
    path: "/:website_url", 
    element: <Live /> 
  },
  
  // Auth related routes
  {
    path: "/logout",
    element: <Logout />
  },
  
  // Error pages
  { 
    path: "/unauthorized", 
    element: <Unauthorized /> 
  },
  { 
    path: "/*", 
    element: <PageNotFound /> 
  },
];

export default routes;
