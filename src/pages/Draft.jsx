import React, { useEffect, useState, Suspense, lazy } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRejectionSection } from "../services/draftApi";
import ErrorBoundary from "../components/ErrorBoundary";

// Lazy load components to prevent context errors
const HeaderDraft = lazy(() => import("../components/HeaderDraft"));
const BannerDraft = lazy(() => import("../components/draft/BannerDraft"));
const AboutDraft = lazy(() => import("../components/draft/AboutDraft"));
const ProductsDraft = lazy(() => import("../components/draft/productsDraft"));
const FooterDraft = lazy(() => import("../components/draft/FooterDraft"));
const PreviewPublish = lazy(() => import("../components/draft/PreviewPublish"));
const Testimonials = lazy(() => import("../components/draft/Testimonials"));
const ParticipationDraft = lazy(() => import("../components/draft/ParticipationDraft"));
const MapReview = lazy(() => import("../components/draft/MapReview"));
const RejectSectionBanner = lazy(() => import("../components/draft/RejectSectionBanner"));

const Draft = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const memberId = location.state?.exporterData;
  const token = location.state?.token;

  const {
    data: rejectSectionData,
    error: sectionError,
    isLoading,
  } = useQuery({
    queryKey: ["get-reject-section", memberId],
    queryFn: () => getRejectionSection(memberId),
    enabled: !!memberId,
  });

  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem("sessionData");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "sessionData") {
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        setCustomer(newData);
        
        // If sessionData is cleared, also clear draft editor session
        if (!newData) {
          localStorage.removeItem("draft_editor_session");
          localStorage.setItem("isValidToken", "false");
        }
      }
      
      // Also listen for logout events
      if (event.key === "loggedInUserName" && !event.newValue) {
        // Clear draft session on logout
        localStorage.removeItem("draft_editor_session");
        localStorage.setItem("isValidToken", "false");
      }
    };

    // Listen for localStorage changes
    window.addEventListener("storage", handleStorageChange);

    // Check if user is authenticated
    const checkAuth = () => {
      const loggedInUserName = localStorage.getItem("loggedInUserName");
      const isValidToken = localStorage.getItem("isValidToken");
      
      if (!loggedInUserName || isValidToken === "false") {
        // Redirect to login if not authenticated
        navigate("/auth/login");
      }
    };

    checkAuth();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  // Handle iframe messages for logout
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "LOGOUT") {
        // Clear all local data
        localStorage.clear();
        sessionStorage.clear();
        navigate("/auth/login");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

  if (!memberId || !token) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#dc3545'
      }}>
        <h3>Session Expired</h3>
        <p>Please login again to access the draft editor.</p>
        <button 
          onClick={() => window.location.href = "https://eepc-exporter-home-page.vercel.app/auth/login"}
          style={{
            padding: '10px 20px',
            backgroundColor: '#09367a',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>Loading...</div>}>
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

          <HeaderDraft memberId={memberId.memberId} />
          <ParticipationDraft memberId={memberId.memberId} />
          <BannerDraft memberId={memberId.memberId} />
          <AboutDraft memberId={memberId.memberId} />
          <ProductsDraft memberId={memberId.memberId} />
          <Testimonials memberId={memberId.memberId} />
          <MapReview memberId={memberId.memberId} />
        </div>
        <FooterDraft memberId={memberId.memberId} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Draft;