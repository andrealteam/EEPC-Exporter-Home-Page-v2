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

// Session management system
class SessionManager {
  constructor() {
    this.tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.sessionKey = 'active_sessions';
    this.heartbeatInterval = null;
    
    // Initialize tab session
    this.initializeTab();
  }
  
  // Initialize tab session
  initializeTab() {
    console.log("Initializing tab:", this.tabId);
    
    // Register this tab as active
    this.registerTab();
    
    // Start heartbeat to keep session alive
    this.startHeartbeat();
    
    // Set up cleanup on tab close
    window.addEventListener('beforeunload', () => {
      this.unregisterTab();
    });
  }
  
  // Register this tab in active sessions
  registerTab() {
    const activeSessions = this.getActiveSessions();
    
    // Add this tab to active sessions
    activeSessions[this.tabId] = {
      id: this.tabId,
      lastActive: Date.now(),
      status: 'active'
    };
    
    localStorage.setItem(this.sessionKey, JSON.stringify(activeSessions));
    
    // Trigger storage event for other tabs
    this.triggerStorageEvent();
  }
  
  // Unregister tab (on close)
  unregisterTab() {
    const activeSessions = this.getActiveSessions();
    delete activeSessions[this.tabId];
    localStorage.setItem(this.sessionKey, JSON.stringify(activeSessions));
    this.triggerStorageEvent();
  }
  
  // Update heartbeat
  updateHeartbeat() {
    const activeSessions = this.getActiveSessions();
    if (activeSessions[this.tabId]) {
      activeSessions[this.tabId].lastActive = Date.now();
      localStorage.setItem(this.sessionKey, JSON.stringify(activeSessions));
    }
  }
  
  // Start heartbeat (update every 2 seconds)
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.updateHeartbeat();
    }, 2000);
  }
  
  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
  
  // Get all active sessions
  getActiveSessions() {
    try {
      const sessions = localStorage.getItem(this.sessionKey);
      return sessions ? JSON.parse(sessions) : {};
    } catch (e) {
      return {};
    }
  }
  
  // Clean up old sessions (older than 10 seconds)
  cleanupOldSessions() {
    const activeSessions = this.getActiveSessions();
    const now = Date.now();
    let changed = false;
    
    for (const tabId in activeSessions) {
      if (now - activeSessions[tabId].lastActive > 10000) { // 10 seconds
        delete activeSessions[tabId];
        changed = true;
      }
    }
    
    if (changed) {
      localStorage.setItem(this.sessionKey, JSON.stringify(activeSessions));
      this.triggerStorageEvent();
    }
  }
  
  // Check if this tab is the primary session holder
  isPrimarySession() {
    const activeSessions = this.getActiveSessions();
    const sessionKeys = Object.keys(activeSessions);
    
    if (sessionKeys.length === 0) return false;
    
    // Sort by registration time (oldest first)
    const sortedTabs = sessionKeys.sort((a, b) => {
      return activeSessions[a].lastActive - activeSessions[b].lastActive;
    });
    
    // The oldest active tab is the primary
    return sortedTabs[0] === this.tabId;
  }
  
  // Trigger storage event to notify other tabs
  triggerStorageEvent() {
    const event = new StorageEvent('storage', {
      key: this.sessionKey,
      newValue: localStorage.getItem(this.sessionKey),
      oldValue: localStorage.getItem(this.sessionKey),
      url: window.location.href
    });
    window.dispatchEvent(event);
  }
  
  // Check session validity
  checkSessionValidity() {
    // Check if user has valid session data
    const sessionData = this.getSessionData();
    const hasValidSession = !!sessionData;
    
    // Check if this tab is the primary session
    const isPrimary = this.isPrimarySession();
    
    console.log("Session check:", {
      tabId: this.tabId,
      hasValidSession,
      isPrimary,
      sessionData: sessionData ? 'exists' : 'none'
    });
    
    return {
      isValid: hasValidSession && isPrimary,
      isPrimary,
      hasSession: hasValidSession
    };
  }
  
  // Get session data from localStorage
  getSessionData() {
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
        try {
          return JSON.parse(data);
        } catch (e) {
          return data; // Return as string if not JSON
        }
      }
    }
    
    return null;
  }
  
  // Force logout (clear all sessions)
  forceLogout() {
    // Clear session data
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
    
    possibleKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear active sessions
    localStorage.removeItem(this.sessionKey);
    
    // Trigger storage event
    this.triggerStorageEvent();
    
    console.log("Force logout executed");
  }
}

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
  const [sessionStatus, setSessionStatus] = useState('');
  const sessionManagerRef = useRef(null);

  // Initialize session manager
  useEffect(() => {
    sessionManagerRef.current = new SessionManager();
    
    // Clean up on unmount
    return () => {
      if (sessionManagerRef.current) {
        sessionManagerRef.current.stopHeartbeat();
        sessionManagerRef.current.unregisterTab();
      }
    };
  }, []);

  // Main session check function
  const checkSession = () => {
    if (!sessionManagerRef.current) return;
    
    const sessionCheck = sessionManagerRef.current.checkSessionValidity();
    
    console.log("Session check result:", sessionCheck);
    
    if (sessionCheck.isValid) {
      // Valid session and primary tab
      setSessionStatus('Primary tab with valid session');
      unlockEditing();
      setIsEditingLocked(false);
    } else if (sessionCheck.hasSession && !sessionCheck.isPrimary) {
      // Has session but not primary tab (duplicate tab)
      setSessionStatus('Duplicate tab - View only');
      lockEditing();
      setIsEditingLocked(true);
    } else {
      // No valid session
      setSessionStatus('No valid session');
      lockEditing();
      setIsEditingLocked(true);
    }
    
    setSessionChecked(true);
  };

  // Set up session checking
  useEffect(() => {
    if (!sessionManagerRef.current) return;
    
    // Initial check after 1 second
    const initialTimer = setTimeout(() => {
      checkSession();
    }, 1000);
    
    // Check every 3 seconds
    const checkInterval = setInterval(() => {
      sessionManagerRef.current.cleanupOldSessions();
      checkSession();
    }, 3000);
    
    // Listen for storage events (cross-tab logout)
    const handleStorageChange = (e) => {
      if (e.key === 'active_sessions' || 
          e.key?.includes('session') || 
          e.key?.includes('auth') ||
          e.key?.includes('token') ||
          e.key?.includes('user')) {
        console.log("Storage change detected:", e.key);
        checkSession();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      clearTimeout(initialTimer);
      clearInterval(checkInterval);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle manual logout
  const handleLogout = () => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.forceLogout();
    }
    
    // Redirect to login
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

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
          Initializing session...
        </div>
        <div style={{ fontSize: "14px", color: "#777", textAlign: "center" }}>
          Please wait while we set up your editing session
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
          padding: "8px 16px",
          background: isEditingLocked ? "#ff4444" : "#4CAF50",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
        }}>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            {isEditingLocked ? "🔒 View Only Mode" : "✏️ Edit Mode"}
            <span style={{ fontSize: "12px", marginLeft: "10px", opacity: 0.8 }}>
              {sessionStatus}
            </span>
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            {!isEditingLocked && (
              <button
                onClick={handleLogout}
                style={{
                  background: "white",
                  color: "#ff4444",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}
              >
                Logout
              </button>
            )}
            
            <button
              onClick={() => window.location.href = "/login"}
              style={{
                background: "white",
                color: "#4CAF50",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px"
              }}
            >
              {isEditingLocked ? "Login" : "Switch Account"}
            </button>
          </div>
        </div>

        {/* Add margin for fixed header */}
        <div style={{ marginTop: "50px" }}></div>

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