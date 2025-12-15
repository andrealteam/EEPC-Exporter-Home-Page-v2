import React, { useEffect, useState, useRef } from "react";
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

/* 🔒 LOCK EDITING FUNCTION */
const lockEditing = () => {
  console.log("🔒 Locking editing - View Only Mode");
  
  // Disable all form inputs
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.disabled = true;
    el.readOnly = true;
    el.style.cursor = "not-allowed";
    el.style.backgroundColor = "#f5f5f5";
  });

  // Disable all contenteditable elements
  document.querySelectorAll('[contenteditable="true"]').forEach((el) => {
    el.setAttribute("contenteditable", "false");
    el.style.cursor = "not-allowed";
  });

  // Disable all buttons except logout/exit
  document.querySelectorAll("button").forEach((el) => {
    if (!el.id?.includes("logout") && !el.id?.includes("login")) {
      el.disabled = true;
      el.style.cursor = "not-allowed";
      el.style.opacity = "0.6";
    }
  });

  // Visual indicators
  document.body.style.pointerEvents = "none";
  document.body.style.userSelect = "none";
  document.body.style.opacity = "0.9";
  document.body.style.cursor = "not-allowed";

  // Add a notification banner at top
  const bannerId = "session-expired-banner";
  if (!document.getElementById(bannerId)) {
    const banner = document.createElement("div");
    banner.id = bannerId;
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: #ff4444;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 10000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 20px;
        padding-right: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      ">
        <div style="font-weight: bold;">🔒 View Only Mode - Login to Edit</div>
        <button id="login-button-top" 
                style="
                  background: white;
                  color: #ff4444;
                  border: none;
                  padding: 6px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-weight: bold;
                ">
          Login
        </button>
      </div>
    `;
    document.body.prepend(banner);
    
    // Add margin to body to account for banner
    document.body.style.marginTop = "50px";
    
    // Add click handler for login button
    document.getElementById("login-button-top").onclick = () => {
      window.location.href = "/login";
    };
  }
};

/* 🔓 UNLOCK EDITING FUNCTION */
const unlockEditing = () => {
  console.log("🔓 Unlocking editing - Edit Mode Enabled");
  
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.disabled = false;
    el.readOnly = false;
    el.style.cursor = "";
    el.style.backgroundColor = "";
  });

  document.querySelectorAll('[contenteditable="false"]').forEach((el) => {
    el.setAttribute("contenteditable", "true");
    el.style.cursor = "";
  });

  document.querySelectorAll("button").forEach((el) => {
    el.disabled = false;
    el.style.cursor = "";
    el.style.opacity = "";
  });

  document.body.style.pointerEvents = "";
  document.body.style.userSelect = "";
  document.body.style.opacity = "";
  document.body.style.cursor = "";
  document.body.style.marginTop = "";

  // Remove banner
  const banner = document.getElementById("session-expired-banner");
  if (banner) banner.remove();
};

// SIMPLE SESSION CHECK - NO COMPLEX TAB MANAGEMENT
const checkIfUserIsLoggedIn = () => {
  console.log("=== SIMPLE SESSION CHECK ===");
  
  // Check all possible session keys
  const possibleKeys = [
    'sessionData',
    'userData', 
    'authData',
    'token',
    'user',
    'userSession',
    'authToken',
    'loginData'
  ];
  
  for (const key of possibleKeys) {
    const data = localStorage.getItem(key);
    if (data) {
      console.log(`✅ Found session with key: ${key}`);
      return true;
    }
  }
  
  console.log("❌ No session found");
  return false;
};

const Draft = () => {
  const location = useLocation();
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
  
  const [isEditingLocked, setIsEditingLocked] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const checkIntervalRef = useRef(null);

  // SIMPLE SESSION CHECK - When user is logged in, unlock editing
  const checkSession = () => {
    const isLoggedIn = checkIfUserIsLoggedIn();
    
    if (isLoggedIn) {
      console.log("✅ User is logged in - Unlocking editing");
      unlockEditing();
      setIsEditingLocked(false);
    } else {
      console.log("❌ User is not logged in - Locking editing");
      lockEditing();
      setIsEditingLocked(true);
    }
    
    setSessionChecked(true);
  };

  // Initial check on component mount
  useEffect(() => {
    console.log("=== Component Mounted ===");
    console.log("Location state:", location.state);
    
    // If token is passed in location state, store it
    if (token) {
      console.log("✅ Token received in location state, storing...");
      // Store the token in localStorage for session persistence
      localStorage.setItem('draftAuthToken', token);
    }
    
    // Check memberId for token
    if (memberId?.token) {
      console.log("✅ Token found in memberId, storing...");
      localStorage.setItem('draftAuthToken', memberId.token);
    }
    
    // Initial check
    checkSession();
    
    // Set up periodic check every 2 seconds
    checkIntervalRef.current = setInterval(checkSession, 2000);
    
    // Listen for storage changes (cross-tab logout)
    const handleStorageChange = (e) => {
      console.log("Storage event detected:", e.key);
      checkSession();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Page became visible, checking session...");
        checkSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check on window focus
    const handleFocus = () => {
      console.log("Window focused, checking session...");
      checkSession();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Manual logout function
  const handleLogout = () => {
    console.log("=== Manual Logout ===");
    
    // Clear all possible session keys
    const keysToClear = [
      'sessionData',
      'userData', 
      'authData',
      'token',
      'user',
      'userSession',
      'authToken',
      'loginData',
      'draftAuthToken'
    ];
    
    keysToClear.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log("All session data cleared from localStorage");
    
    // Lock editing immediately
    lockEditing();
    setIsEditingLocked(true);
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  };

  // Quick debug function
  const debugSession = () => {
    console.log("=== DEBUG SESSION INFO ===");
    console.log("isEditingLocked:", isEditingLocked);
    console.log("sessionChecked:", sessionChecked);
    
    // List all localStorage items
    console.log("All localStorage items:");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`  ${key}:`, localStorage.getItem(key));
    }
    
    checkSession();
  };

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

  // Show loading while checking session
  if (isLoading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        flexDirection: "column",
        gap: "20px"
      }}>
        <div style={{ fontSize: "18px", color: "#555" }}>
          Loading draft data...
        </div>
      </div>
    );
  }

  return (
    <ChangeTrackerProvider>
      <div className="container">
        {/* Debug Panel (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: "fixed",
            top: "10px",
            left: "10px",
            zIndex: 10000,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "12px",
            maxWidth: "300px"
          }}>
            <div><strong>Debug Info:</strong></div>
            <div>Status: {isEditingLocked ? "🔒 LOCKED" : "✅ UNLOCKED"}</div>
            <button 
              onClick={debugSession}
              style={{
                marginTop: "5px",
                padding: "5px 10px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer"
              }}
            >
              Debug Session
            </button>
          </div>
        )}

        {/* Session Control Bar */}
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          zIndex: 9999,
          padding: "10px 20px",
          background: isEditingLocked ? "#ff4444" : "#4CAF50",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
        }}>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            {isEditingLocked ? "🔒 View Only Mode" : "✏️ Edit Mode"}
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            {!isEditingLocked ? (
              <>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "white",
                    color: "#ff4444",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Logout
                </button>
                <button
                  onClick={() => window.open(window.location.href, '_blank')}
                  style={{
                    background: "#2196F3",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Open New Tab
                </button>
              </>
            ) : (
              <button
                onClick={() => window.location.href = "/login"}
                style={{
                  background: "white",
                  color: "#ff4444",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Login to Edit
              </button>
            )}
          </div>
        </div>

        {/* Add margin for fixed header */}
        <div style={{ marginTop: "60px" }}></div>

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
          isLocked={isEditingLocked}
        />

        {/* All draft components */}
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