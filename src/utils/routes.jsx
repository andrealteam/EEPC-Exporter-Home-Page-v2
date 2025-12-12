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

const routes = [
  { path: "/auth", element: <Login /> },
  { path: "/sections", element: <Section /> },
  { path: "/", element: <Verify /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Register /> },
  { path: "/review", element: <Review /> },
  { path: "/final-review", element: <FinalReview /> },
  { path: "/edit", element: <Draft /> },
  { path: "/preview/:token", element: <Preview /> },
  { path: "/:website_url", element: <Live /> },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "/*", element: <PageNotFound /> },
];

export default routes;
