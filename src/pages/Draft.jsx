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

/* 🔒 LOCK EDITING FUNCTION */
const lockEditing = () => {
  console.log("Locking editing - View Only Mode");
  
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
  console.log("Unlocking editing - Edit Mode Enabled");
  
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
  const [debugInfo, setDebugInfo] = useState("");

  // Main session check function - FIXED VERSION
  const checkSession = () => {
    // Check ALL localStorage keys to see what's available
    const allKeys = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      allKeys[key] = localStorage.getItem(key);
    }
    
    console.log("=== DEBUG: All localStorage keys ===", allKeys);
    console.log("=== DEBUG: Checking for session keys ===");
    
    // Try to find session data with different possible key names
    const possibleSessionKeys = [
      'sessionData',
      'userData',
      'authData',
      'token',
      'user',
      'userSession',
      'authToken',
      'loginData'
    ];
    
    let foundSession = null;
    let foundKey = null;
    
    for (const key of possibleSessionKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        console.log(`Found potential session key: ${key}`, data);
        foundSession = data;
        foundKey = key;
        break;
      }
    }
    
    setDebugInfo(`Keys in localStorage: ${Object.keys(allKeys).join(', ')}`);
    
    if (foundSession) {
      console.log(`✅ Session found with key: ${foundKey}`);
      try {
        const parsedSession = JSON.parse(foundSession);
        console.log("✅ Parsed session data:", parsedSession);
        
        unlockEditing();
        setIsEditingLocked(false);
      } catch (error) {
        console.error("❌ Error parsing session data:", error);
        // Even if it's not JSON, if there's a token string, consider it valid
        console.log("✅ Non-JSON session data found, still considering valid");
        unlockEditing();
        setIsEditingLocked(false);
      }
    } else {
      console.log("❌ No session found in localStorage");
      console.log("Available keys:", Object.keys(allKeys));
      lockEditing();
      setIsEditingLocked(true);
    }
    
    setSessionChecked(true);
  };

  // Initial check and setup
  useEffect(() => {
    console.log("=== Draft Component Mounted ===");
    console.log("Location state:", location.state);
    
    // Check if token is passed in location state
    if (token) {
      console.log("✅ Token found in location state, storing in localStorage");
      // Store token in localStorage for session management
      localStorage.setItem('authToken', token);
    }
    
    // Check if memberId has token
    if (memberId?.token) {
      console.log("✅ Token found in memberId, storing in localStorage");
      localStorage.setItem('authToken', memberId.token);
    }
    
    // Initial check
    checkSession();
    
    // Set up interval to check every 3 seconds
    const intervalId = setInterval(checkSession, 3000);
    
    // Listen for storage changes (cross-tab logout)
    const handleStorageChange = (e) => {
      console.log("Storage event:", e.key, e.newValue);
      checkSession();
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Check when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Check on window focus
    const handleFocus = () => {
      checkSession();
    };
    
    window.addEventListener("focus", handleFocus);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Debug: Log current state
  useEffect(() => {
    console.log("Current editing state:", isEditingLocked ? "LOCKED" : "UNLOCKED");
    console.log("Session checked:", sessionChecked);
  }, [isEditingLocked, sessionChecked]);

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

  // Add a button to manually check session
  const handleManualCheck = () => {
    console.log("=== MANUAL SESSION CHECK ===");
    checkSession();
  };

  // Show loading while checking session
  if (isLoading || !sessionChecked) {
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
        <div style={{ fontSize: "18px", color: "#555" }}>Checking session...</div>
        <div style={{ fontSize: "14px", color: "#777" }}>
          Debug Info: {debugInfo}
        </div>
        <button 
          onClick={handleManualCheck}
          style={{
            padding: "10px 20px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Check Session Manually
        </button>
        <button 
          onClick={() => window.location.href = "/login"}
          style={{
            padding: "10px 20px",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <ChangeTrackerProvider>
      <div className="container">
        {/* Debug Panel */}
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
          maxWidth: "300px",
          maxHeight: "200px",
          overflow: "auto"
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>Status: {isEditingLocked ? "🔒 LOCKED" : "✅ UNLOCKED"}</div>
          <div>Session Checked: {sessionChecked ? "Yes" : "No"}</div>
          <button 
            onClick={handleManualCheck}
            style={{
              marginTop: "5px",
              padding: "5px 10px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "10px"
            }}
          >
            Check Session
          </button>
        </div>

        {/* Manual Login Button - Always visible */}
        <button
          onClick={() => window.location.href = "/login"}
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            zIndex: 9999,
            padding: "8px 16px",
            background: isEditingLocked ? "#ff4444" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px"
          }}
        >
          {isEditingLocked ? "🔒 Login to Edit" : "✏️ Edit Mode"}
        </button>

        {/* Status Indicator */}
        <div style={{
          position: "fixed",
          top: "50px",
          right: "10px",
          zIndex: 9998,
          padding: "6px 12px",
          borderRadius: "4px",
          background: isEditingLocked ? "#ff4444" : "#4CAF50",
          color: "white",
          fontSize: "12px",
          border: "1px solid #ddd",
          fontWeight: "bold"
        }}>
          {isEditingLocked ? "VIEW ONLY" : "EDITING ENABLED"}
        </div>

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