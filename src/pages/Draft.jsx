import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { HeaderDraft } from "../components";
import { checkAuth, clearAuth, handleSuccessfulLogin } from "../utils/auth";
import BannerDraft from "../components/draft/BannerDraft";
import AboutDraft from "../components/draft/AboutDraft";
import WhoWeAreDraft from "../components/draft/WhoWeAreDraft";
import ProductsDraft from "../components/draft/productsDraft";
import FooterDraft from "../components/draft/FooterDraft";
import PreviewPublish from "../components/draft/PreviewPublish";
import CertificateDraft from "../components/draft/CertificateDraft";
import Testimonials from "../components/draft/Testimonials";
import AwardsDraft from "../components/draft/AwardsDraft";
import GalleryDraft from "../components/draft/GalleryDraft";
import ParticipationDraft from "../components/draft/ParticipationDraft";
import MapReview from "../components/draft/MapReview";
import RejectSectionBanner from "../components/draft/RejectSectionBanner";
import { useQuery } from "@tanstack/react-query";
import { getRejectionSection } from "../services/draftApi";
import { ChangeTrackerProvider } from "../contexts/ChangeTrackerContext";
import { jwtVerify } from "jose";

const LOGIN_URL = "/auth/login";

const Draft = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Get memberId and token from URL or location state
  const memberId = useMemo(() => {
    return location.state?.exporterData || searchParams.get('memberId');
  }, [location.state, searchParams]);

  // Function to verify and handle token
  const verifyAndHandleToken = useCallback(async (token) => {
    try {
      const secret = new TextEncoder().encode("fgghw53ujf8836d");
      const { payload } = await jwtVerify(token, secret);
      
      if (payload) {
        handleSuccessfulLogin({
          token,
          ...payload,
          exp: payload.exp || Math.floor(Date.now() / 1000) + 3600,
        });
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token verification failed:", error);
      setAuthError("Invalid or expired token");
      clearAuth();
      setIsCheckingAuth(false);
      return false;
    }
  }, []);

  // Function to handle authentication check
  const checkAuthentication = useCallback(async () => {
    // Check for token in URL first
    const urlToken = searchParams.get('token');
    
    if (urlToken) {
      const isValid = await verifyAndHandleToken(urlToken);
      if (isValid) return true;
    }
    
    // Check existing auth
    const authStatus = checkAuth();
    setIsAuthenticated(authStatus);
    setIsCheckingAuth(false);
    
    if (!authStatus) {
      clearAuth();
      if (!window.location.pathname.includes('/auth/login')) {
        // Store current URL for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = LOGIN_URL;
      }
    }
    
    return authStatus;
  }, [searchParams, verifyAndHandleToken]);

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
    
    // Set up storage event listener for logout from other tabs/windows
    const handleStorageChange = (event) => {
      if (event.key === 'sessionData' || event.key === null) {
        checkAuthentication();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthentication]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        color: '#1e293b',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  const {
    data: rejectSectionData,
    error: sectionError,
    isLoading,
  } = useQuery({
    queryKey: ["get-reject-section", memberId],
    queryFn: () => getRejectionSection(memberId),
    enabled: !!memberId,
  });
  const [userData, setUserData] = useState(null);

  // Handle customer data separately from authentication
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem("sessionData");
    return stored ? JSON.parse(stored) : null;
  });

  // Update customer data when it changes
  useEffect(() => {
    const stored = localStorage.getItem("sessionData");
    setCustomer(stored ? JSON.parse(stored) : null);
  }, [isAuthenticated]);

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

  // if (
  //   customer?.member_name === undefined ||
  //   customer?.member_name !== rejectSectionData?.company_name
  // ) {
  //   return (
  //     <div
  //       style={{
  //         height: "100vh",
  //         display: "flex",
  //         flexDirection: "column",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         backgroundColor: "#f8fafc",
  //         color: "#1e293b",
  //         fontFamily: "Inter, sans-serif",
  //       }}
  //     >
  //       <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
  //         Session Expired
  //       </h2>
  //       <p
  //         style={{ fontSize: "1rem", color: "#64748b", marginBottom: "1.5rem" }}
  //       >
  //         Your session has expired or you are not authorized to access this
  //         page.
  //       </p>
  //       <button
  //         onClick={() =>
  //           (window.location.href =
  //             "https://eepc-exporter-home-page-v2.vercel.app/auth/login")
  //         }
  //         style={{
  //           padding: "10px 20px",
  //           backgroundColor: "#2563eb",
  //           color: "white",
  //           border: "none",
  //           borderRadius: "8px",
  //           cursor: "pointer",
  //           fontSize: "1rem",
  //           transition: "background-color 0.2s ease",
  //         }}
  //         onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
  //         onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
  //       >
  //         Go to Login
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <ChangeTrackerProvider>
      <div className="container">
        {rejectMsg.length > 0 && (
          <RejectSectionBanner
            rejectionNumbers={rejectSection}
            rejectMsg={rejectMsg}
          />
        )}

        <PreviewPublish
          memberId={memberId.memberId}
          token={token}
          website_url={memberId.website_url}
          rejectionNumbers={rejectSection}
        />

        {/* 1 */}
        <HeaderDraft memberId={memberId.memberId} />

        <ParticipationDraft memberId={memberId.memberId} />

        {/* 2 */}
        <BannerDraft memberId={memberId.memberId} />

        {/* <CertificateDraft memberId={memberId.memberId} /> */}
        {/* <AwardsDraft memberId={memberId.memberId} /> */}
        {/* <Testimonials memberId={memberId.memberId} /> */}
        {/* <GalleryDraft memberId={memberId.memberId} /> */}

        {/* 4 */}
        <AboutDraft memberId={memberId.memberId} />
        {/* <WhoWeAreDraft memberId={memberId.memberId} /> */}

        {/* 5 */}
        <ProductsDraft memberId={memberId.memberId} />

        <Testimonials memberId={memberId.memberId} />

        <MapReview memberId={memberId.memberId} />
      </div>
      <FooterDraft memberId={memberId.memberId} />
    </ChangeTrackerProvider>
  );
};

export default Draft;
