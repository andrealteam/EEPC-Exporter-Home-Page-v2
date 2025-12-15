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
        <div style="font-weight: bold;">🔒 Tab Session Expired - Return to Original Tab or Login Again</div>
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
          Login Again
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

// Generate a unique tab ID
const generateTabId = () => {
  return 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Check if this tab is the original session tab
const isOriginalTab = () => {
  const tabId = localStorage.getItem('currentTabId');
  const originalTabId = sessionStorage.getItem('originalTabId');
  
  console.log("Tab check - Current tab:", tabId, "Original tab:", originalTabId);
  
  // If no original tab is set yet, this is the first/original tab
  if (!originalTabId) {
    console.log("This is the original tab (no originalTabId set yet)");
    return true;
  }
  
  // If current tab matches original tab ID
  if (tabId === originalTabId) {
    console.log("This is the original tab (IDs match)");
    return true;
  }
  
  console.log("This is a duplicate tab");
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
  const [isDuplicateTab, setIsDuplicateTab] = useState(false);
  const [tabId, setTabId] = useState('');

  // Initialize tab ID and session
  useEffect(() => {
    console.log("=== Initializing Tab Session ===");
    
    // Generate or get current tab ID
    let currentTabId = localStorage.getItem('currentTabId');
    if (!currentTabId) {
      currentTabId = generateTabId();
      localStorage.setItem('currentTabId', currentTabId);
      console.log("Generated new tab ID:", currentTabId);
    }
    setTabId(currentTabId);
    
    // Get original tab ID from sessionStorage
    const originalTabId = sessionStorage.getItem('originalTabId');
    
    // If this is the first time loading (no originalTabId in sessionStorage)
    if (!originalTabId) {
      console.log("Setting this as original tab");
      sessionStorage.setItem('originalTabId', currentTabId);
      sessionStorage.setItem('tabInitialized', 'true');
      setIsDuplicateTab(false);
    } else {
      // Check if this tab is the original tab
      const isOriginal = originalTabId === currentTabId;
      setIsDuplicateTab(!isOriginal);
      console.log("Duplicate tab detected:", !isOriginal);
    }
    
    // Set up beforeunload to clean up if this is the original tab
    const handleBeforeUnload = () => {
      const currentTab = localStorage.getItem('currentTabId');
      const originalTab = sessionStorage.getItem('originalTabId');
      
      if (currentTab === originalTab) {
        console.log("Original tab closing - clearing sessionStorage");
        sessionStorage.removeItem('originalTabId');
        sessionStorage.removeItem('tabInitialized');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Main session check function - TAB SPECIFIC
  const checkSession = () => {
    console.log("=== Tab-Specific Session Check ===");
    console.log("Tab ID:", tabId);
    console.log("Is duplicate tab:", isDuplicateTab);
    
    // First, check if this is a duplicate tab
    if (isDuplicateTab) {
      console.log("❌ DUPLICATE TAB DETECTED - Locking editing");
      lockEditing();
      setIsEditingLocked(true);
      setSessionChecked(true);
      return;
    }
    
    // For original tab, check session data
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
    
    for (const key of possibleSessionKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        console.log(`✅ Session found with key: ${key}`);
        foundSession = data;
        break;
      }
    }
    
    if (foundSession) {
      console.log("✅ Valid session in original tab - Unlocking editing");
      unlockEditing();
      setIsEditingLocked(false);
    } else {
      console.log("❌ No session found in original tab");
      lockEditing();
      setIsEditingLocked(true);
    }
    
    setSessionChecked(true);
  };

  // Check session periodically
  useEffect(() => {
    if (!tabId) return;
    
    // Initial check after 1 second
    const initialCheck = setTimeout(() => {
      checkSession();
    }, 1000);
    
    // Set up interval to check every 3 seconds
    const intervalId = setInterval(checkSession, 3000);
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'currentTabId' || e.key?.includes('session') || e.key?.includes('auth')) {
        console.log("Session-related storage change:", e.key);
        checkSession();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Check when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Cleanup
    return () => {
      clearTimeout(initialCheck);
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tabId, isDuplicateTab]);

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

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
        <div style={{ fontSize: "18px", color: "#555" }}>
          {isDuplicateTab ? "Checking tab session..." : "Checking authentication..."}
        </div>
        <div style={{ fontSize: "14px", color: "#777", textAlign: "center" }}>
          {isDuplicateTab 
            ? "Duplicate tab detected. Only the original tab can edit." 
            : "Please wait while we verify your session..."}
        </div>
        {isDuplicateTab && (
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
            Login in New Tab
          </button>
        )}
      </div>
    );
  }

  return (
    <ChangeTrackerProvider>
      <div className="container">
        {/* Tab Status Indicator */}
        <div style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 10000,
          padding: "8px 16px",
          borderRadius: "4px",
          background: isDuplicateTab ? "#ff4444" : (isEditingLocked ? "#ff9800" : "#4CAF50"),
          color: "white",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
        }}
        onClick={() => {
          if (isDuplicateTab) {
            window.location.href = "/login";
          }
        }}
        title={isDuplicateTab ? "Click to login in this tab" : "Session status"}>
          {isDuplicateTab ? "🚫 Duplicate Tab" : (isEditingLocked ? "🔒 View Only" : "✏️ Edit Mode")}
        </div>

        {/* Debug info (optional - can remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: "fixed",
            top: "50px",
            right: "10px",
            zIndex: 9999,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "3px",
            fontSize: "10px",
            maxWidth: "200px"
          }}>
            Tab: {tabId.substring(0, 10)}...
            <br />
            Status: {isDuplicateTab ? "Duplicate" : "Original"}
          </div>
        )}

        {/* Manual override button for testing (optional) */}
        {isDuplicateTab && (
          <button
            onClick={() => {
              // Force this tab to become the original tab
              sessionStorage.setItem('originalTabId', tabId);
              setIsDuplicateTab(false);
              checkSession();
            }}
            style={{
              position: "fixed",
              top: "80px",
              right: "10px",
              zIndex: 9998,
              padding: "5px 10px",
              background: "#9C27B0",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "10px"
            }}
          >
            Make This Original Tab
          </button>
        )}

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
          isLocked={isEditingLocked || isDuplicateTab}
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