import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChangeTrackerProvider } from "./contexts/ChangeTrackerContext";
import routes from "./utils/routes.jsx";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// import "./responsive.css";

// Hard-redirect the legacy domain to the new v2 domain (preserve path/query)
if (typeof window !== "undefined") {
  const legacyHost = "eepc-exporter-home-page.vercel.app";
  const targetOrigin = "https://eepc-exporter-home-page-v2.vercel.app";

  if (window.location.host === legacyHost) {
    const { pathname, search, hash } = window.location;
    window.location.replace(`${targetOrigin}${pathname}${search}${hash}`);
  }
}

// Initialize the router and query client
const router = createBrowserRouter(routes);
const queryClient = new QueryClient();

// Render the app
createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <ChangeTrackerProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" reverseOrder={false} duration="10000" />
    </ChangeTrackerProvider>
  </QueryClientProvider>
);
