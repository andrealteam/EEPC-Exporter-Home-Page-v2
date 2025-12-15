import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { HeaderDraft } from "../components";
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

const LOGIN_URL = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";

const Draft = () => {
  const location = useLocation();
  const memberId = location.state?.exporterData;
  const token = location.state?.token;
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  
  useEffect(() => {
    if (!isAuthorized) {
      const timer = setTimeout(() => {
        setShowError(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthorized]);

  const {
    data: rejectSectionData,
    error: sectionError,
    isLoading: isSectionLoading,
  } = useQuery({
    queryKey: ["get-reject-section", memberId?.memberId],
    queryFn: () => getRejectionSection(memberId?.memberId),
    enabled: !!memberId?.memberId,
  });

  // Check authentication status on component mount and when memberId/token changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we have token in URL, use it to set/update session
        if (token && memberId) {
          const sessionData = {
            token: token,
            member_id: memberId.memberId,
            member_name: memberId.memberName || '',
            exp: memberId.exp || (Date.now() / 1000) + (60 * 60 * 24) // Default 24h expiration
          };
          localStorage.setItem("sessionData", JSON.stringify(sessionData));
          setIsAuthorized(true);
          return true;
        }

        // Check existing session data
        const storedSession = localStorage.getItem("sessionData");
        if (!storedSession) {
          console.log("No session data found");
          setIsAuthorized(false);
          return false;
        }

        const sessionData = JSON.parse(storedSession);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (sessionData.exp && sessionData.exp < currentTime) {
          console.log("Token expired");
          localStorage.removeItem("sessionData");
          setIsAuthorized(false);
          return false;
        }

        // If we got here, all checks passed
        console.log("Authentication successful");
        setIsAuthorized(true);
        return true;
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthorized(false);
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    // Check auth if we have the necessary data
    if (memberId || token) {
      checkAuth().catch(error => {
        console.error("Auth check failed:", error);
        setIsAuthorized(false);
      });
    } else {
      setIsLoading(false);
    }

    // Set up storage event listener for cross-tab logout
    const handleStorageChange = (event) => {
      if (event.key === "sessionData" || event.key === null) {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Check auth when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [memberId, token]);

  // Show loading state while checking auth
  if (isLoading || isSectionLoading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Show unauthorized/expired session message
  if (!isAuthorized) {
    if (!showError) {
      return (
        <div style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc"
        }}>
          <p>Checking authentication status...</p>
        </div>
      );
    }
    
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        color: "#1e293b",
        fontFamily: "Inter, sans-serif",
        padding: "20px",
        textAlign: "center"
      }}>
        <h2 style={{ marginBottom: "20px" }}>Session Expired</h2>
        <p style={{ marginBottom: "20px" }}>Your session has expired or you don't have permission to access this page.</p>
        <a 
          href={LOGIN_URL}
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#2563eb",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
        >
          Go to Login
        </a>
      </div>
    );
  }

  // Show the main content if authorized
  return (
    <ChangeTrackerProvider>
      <div className="container">
        {rejectSectionData?.reject_message && (
          <RejectSectionBanner
            rejectionNumbers={rejectSectionData.reject_section || []}
            rejectMsg={rejectSectionData.reject_message}
          />
        )}

        <PreviewPublish
          memberId={memberId.memberId}
          token={token}
          website_url={memberId.website_url}
          rejectionNumbers={rejectSectionData?.reject_section || []}
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
    </ChangeTrackerProvider>
  );
};

export default Draft;