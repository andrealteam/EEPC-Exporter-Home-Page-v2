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

const SESSION_KEY = 'draft_editor_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

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
        <div style="font-weight: bold;">🔒 Session Expired - Please Login Again</div>
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

// Session Management Functions
const createSession = (token, memberId) => {
  const sessionData = {
    token: token,
    memberId: memberId,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    tabId: 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  console.log("✅ Session created:", sessionData);
  return sessionData;
};

const getSession = () => {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) {
      return null;
    }
    
    const sessionData = JSON.parse(sessionStr);
    
    // Check if session is expired
    const now = Date.now();
    if (now - sessionData.createdAt > SESSION_TIMEOUT) {
      console.log("❌ Session expired (timeout)");
      clearSession();
      return null;
    }
    
    // Update last activity
    sessionData.lastActivity = now;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    return sessionData;
  } catch (error) {
    console.error("Error parsing session:", error);
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  console.log("✅ Session cleared");
};

const isSessionValid = () => {
  const session = getSession();
  return session !== null;
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
  const [currentTabId, setCurrentTabId] = useState('');
  const checkIntervalRef = useRef(null);

  // Initialize session on component mount
  useEffect(() => {
    console.log("=== Draft Component Mounted ===");
    console.log("Location state:", location.state);
    
    // Check if we have token and memberId in location state
    if (token && memberId?.memberId) {
      console.log("✅ Token and memberId received, creating session...");
      const session = createSession(token, memberId.memberId);
      setCurrentTabId(session.tabId);
      
      // Unlock editing immediately
      unlockEditing();
      setIsEditingLocked(false);
      setSessionChecked(true);
    } else {
      // Check for existing session
      const existingSession = getSession();
      if (existingSession) {
        console.log("✅ Existing session found");
        setCurrentTabId(existingSession.tabId);
        unlockEditing();
        setIsEditingLocked(false);
      } else {
        console.log("❌ No session found");
        lockEditing();
        setIsEditingLocked(true);
      }
      setSessionChecked(true);
    }
  }, []);

  // Set up session checking
  useEffect(() => {
    const checkSession = () => {
      const isValid = isSessionValid();
      
      if (isValid) {
        console.log("✅ Session is valid - Editing enabled");
        unlockEditing();
        setIsEditingLocked(false);
      } else {
        console.log("❌ Session is invalid - Locking editing");
        lockEditing();
        setIsEditingLocked(true);
      }
    };
    
    // Initial check
    checkSession();
    
    // Set up interval to check every 3 seconds
    checkIntervalRef.current = setInterval(checkSession, 3000);
    
    // Listen for storage changes (cross-tab logout)
    const handleStorageChange = (e) => {
      if (e.key === SESSION_KEY) {
        console.log("Session storage changed, checking...");
        checkSession();
      }
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
    
    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle user activity to keep session alive
  useEffect(() => {
    const updateActivity = () => {
      const session = getSession();
      if (session) {
        // Session is automatically updated in getSession()
      }
    };
    
    // Update on user interactions
    const events = ['click', 'keydown', 'mousemove', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    console.log("=== Logout initiated ===");
    
    // Clear session
    clearSession();
    
    // Lock editing immediately
    lockEditing();
    setIsEditingLocked(true);
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  // Handle tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // We don't clear session on tab close anymore
      // Session will expire naturally after timeout
      console.log("Tab closing, session will remain for other tabs");
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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
          {token ? "Creating session..." : "Checking session..."}
        </div>
        <div style={{ fontSize: "14px", color: "#777", textAlign: "center" }}>
          {token ? "Setting up your editing environment" : "Please wait..."}
        </div>
      </div>
    );
  }

  return (
    <ChangeTrackerProvider>
      <div className="container">
        {/* Session Status Bar */}
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          zIndex: 10000,
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
            {!isEditingLocked && (
              <span style={{ fontSize: "12px", marginLeft: "10px", opacity: 0.8 }}>
                Tab ID: {currentTabId.substring(0, 8)}...
              </span>
            )}
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
                  onClick={() => {
                    // Open new tab with current URL
                    window.open(window.location.href, '_blank');
                  }}
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
                onClick={() => window.location.href = "https://eepc-exporter-home-page-v2-whhx.vercel.app/auth/login"}
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
          memberId={memberId?.memberId}
          token={token}
          website_url={memberId?.website_url}
          rejectionNumbers={rejectSection}
          isLocked={isEditingLocked}
        />

        {/* All draft components */}
        <HeaderDraft memberId={memberId?.memberId} />
        <ParticipationDraft memberId={memberId?.memberId} />
        <BannerDraft memberId={memberId?.memberId} />
        <AboutDraft memberId={memberId?.memberId} />
        <ProductsDraft memberId={memberId?.memberId} />
        <Testimonials memberId={memberId?.memberId} />
        <MapReview memberId={memberId?.memberId} />
      </div>
      <FooterDraft memberId={memberId?.memberId} />
    </ChangeTrackerProvider>
  );
};

export default Draft;