import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HeaderDraft } from "../components";
import BannerDraft from "../components/draft/BannerDraft";
import AboutDraft from "../components/draft/AboutDraft";
import ProductsDraft from "../components/draft/productsDraft";
import FooterDraft from "../components/draft/FooterDraft";
import PreviewPublish from "../components/draft/PreviewPublish";
import Testimonials from "../components/draft/Testimonials";
import ParticipationDraft from "../components/draft/ParticipationDraft";
import MapReview from "../components/draft/MapReview";
import RejectSectionBanner from "../components/draft/RejectSectionBanner";
import { useQuery } from "@tanstack/react-query";
import { getRejectionSection } from "../services/draftApi";

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

  // Function to check authentication status
  const checkAuthStatus = () => {
    const loggedInUserName = localStorage.getItem("loggedInUserName");
    const memberIdCookie = localStorage.getItem("member_id");
    const isValidToken = localStorage.getItem("isValidToken");
    
    console.log("Auth check:", { loggedInUserName, memberIdCookie, isValidToken });
    
    // If any critical auth data is missing or token is invalid, redirect to login
    if (!loggedInUserName || !memberIdCookie || isValidToken === "false") {
      console.log("Authentication failed, redirecting to login");
      
      // Clear any remaining data
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login
      setTimeout(() => {
        window.location.href = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";
      }, 100);
      
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    // Check auth on component mount
    if (!checkAuthStatus()) {
      return;
    }

    const handleStorageChange = (event) => {
      console.log("Storage changed:", event.key, event.newValue);
      
      if (event.key === "sessionData") {
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        setCustomer(newData);
        
        if (!newData) {
          localStorage.removeItem("draft_editor_session");
          localStorage.setItem("isValidToken", "false");
        }
      }
      
      // Listen for logout events from AuthContext
      if (event.key === "logout") {
        console.log("Logout detected via storage event");
        localStorage.setItem("isValidToken", "false");
        localStorage.clear();
        sessionStorage.clear();
        
        setTimeout(() => {
          window.location.href = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";
        }, 100);
      }
      
      if (event.key === "loggedInUserName" && !event.newValue) {
        localStorage.removeItem("draft_editor_session");
        localStorage.setItem("isValidToken", "false");
        setTimeout(() => {
          window.location.href = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";
        }, 100);
      }
      
      if (event.key === "isValidToken" && event.newValue === "false") {
        console.log("Invalid token detected, logging out");
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          window.location.href = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";
        }, 100);
      }
    };

    // Listen for BroadcastChannel messages
    let authChannel;
    if (typeof BroadcastChannel !== "undefined") {
      authChannel = new BroadcastChannel("auth_channel");
      authChannel.onmessage = (event) => {
        if (event.data.type === "LOGOUT") {
          console.log("BroadcastChannel logout received in Draft");
          localStorage.setItem("isValidToken", "false");
          localStorage.clear();
          sessionStorage.clear();
          setTimeout(() => {
            window.location.href = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";
          }, 100);
        }
      };
    }

    // Listen for postMessage events
    const handleMessage = (event) => {
      if (event.data?.type === "FORCE_LOGOUT" || event.data?.type === "LOGOUT") {
        console.log("PostMessage logout received");
        localStorage.setItem("isValidToken", "false");
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          window.location.href = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";
        }, 100);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("message", handleMessage);

    // Check auth periodically (every 10 seconds)
    const authInterval = setInterval(checkAuthStatus, 10000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("message", handleMessage);
      if (authChannel) authChannel.close();
      clearInterval(authInterval);
    };
  }, [navigate]);

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

  // If no memberId or token, show expired session
  if (!memberId || !token) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>Session Expired</h3>
        <p style={{ marginBottom: '2rem' }}>Your session has expired. Please login again.</p>
        <button 
          onClick={() => window.location.href = "https://eepc-exporter-home-page-v2.vercel.app/auth/login"}
          style={{
            padding: '12px 24px',
            backgroundColor: '#09367a',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
};

export default Draft;