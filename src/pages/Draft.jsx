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

const LOGIN_URL = "https://eepc-exporter-home-page-v2-whhx.vercel.app/auth/login";
const SESSION_KEY = 'draft_editor_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/* 🔒 LOCK EDITING FUNCTION - FIXED */
const lockEditing = () => {
  console.log("🔒 Locking editing - View Only Mode");
  
  // Disable all form inputs
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.disabled = true;
    el.readOnly = true;
  });

  // Disable all contenteditable elements
  document.querySelectorAll('[contenteditable="true"]').forEach((el) => {
    el.setAttribute("contenteditable", "false");
  });

  // Disable all buttons EXCEPT buttons with id containing "login" or "logout"
  document.querySelectorAll("button").forEach((el) => {
    const id = el.id || '';
    const text = el.textContent || '';
    if (!id.includes('login') && !id.includes('logout') && 
        !text.includes('Login') && !text.includes('Logout')) {
      el.disabled = true;
    }
  });

  // Remove pointer events and selection from body, but allow clicking on login button
  document.body.style.pointerEvents = "none";
  document.body.style.userSelect = "none";
  
  // Ensure login/logout buttons remain clickable
  const loginButtons = document.querySelectorAll('button[id*="login"], button[id*="logout"]');
  loginButtons.forEach(button => {
    button.style.pointerEvents = "auto";
    button.style.position = "relative";
    button.style.zIndex = "10001";
  });
};

/* 🔓 UNLOCK EDITING FUNCTION - FIXED */
const unlockEditing = () => {
  console.log("🔓 Unlocking editing - Edit Mode Enabled");
  
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.disabled = false;
    el.readOnly = false;
  });

  document.querySelectorAll('[contenteditable="false"]').forEach((el) => {
    el.setAttribute("contenteditable", "true");
  });

  // Enable all buttons
  document.querySelectorAll("button").forEach((el) => {
    el.disabled = false;
  });

  document.body.style.pointerEvents = "";
  document.body.style.userSelect = "";
};

// Session Management Functions
const createSession = (token, memberId) => {
  const sessionData = {
    token: token,
    memberId: memberId,
    createdAt: Date.now(),
    lastActivity: Date.now()
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  console.log("✅ Session created");
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
  
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const checkIntervalRef = useRef(null);

  // Initialize session on component mount
  useEffect(() => {
    console.log("=== Draft Component Mounted ===");
    
    // Check if we have token and memberId in location state
    if (token && memberId?.memberId) {
      console.log("✅ Token and memberId received, creating session...");
      createSession(token, memberId.memberId);
      setIsLoggedIn(true);
      
      // Unlock editing immediately
      unlockEditing();
      setSessionChecked(true);
    } else {
      // Check for existing session
      const existingSession = getSession();
      if (existingSession) {
        console.log("✅ Existing session found");
        setIsLoggedIn(true);
        unlockEditing();
      } else {
        console.log("❌ No session found");
        setIsLoggedIn(false);
        lockEditing();
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
        setIsLoggedIn(true);
        unlockEditing();
      } else {
        console.log("❌ Session is invalid - Locking editing");
        setIsLoggedIn(false);
        lockEditing();
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
    setIsLoggedIn(false);
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = LOGIN_URL;
    }, 1000);
  };

  // Handle login button click
  const handleLoginClick = () => {
    console.log("Login button clicked, redirecting to:", LOGIN_URL);
    window.location.href = LOGIN_URL;
  };

  // Handle tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // We don't clear session on tab close
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

  // Show session expired/unauthorized access UI when not logged in
  if (!isLoggedIn) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          color: "#1e293b",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Session Expired
        </h2>
        <p
          style={{ fontSize: "1rem", color: "#64748b", marginBottom: "1.5rem" }}
        >
          Your session has expired or you are not authorized to access this page.
        </p>
        <button
          onClick={() => window.location.href = LOGIN_URL}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <ChangeTrackerProvider>
      <div className="container">
        {/* Only Logout Button (Visible when logged in) */}
        {isLoggedIn && (
          <button
            id="logout-button-main"
            onClick={handleLogout}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 10000,
              padding: "10px 20px",
              background: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease",
              fontFamily: "Arial, sans-serif"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#ff3333";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#ff4444";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
            }}
            onMouseDown={(e) => {
              e.target.style.background = "#ff2222";
              e.target.style.transform = "translateY(1px)";
            }}
            onMouseUp={(e) => {
              e.target.style.background = "#ff3333";
              e.target.style.transform = "translateY(-1px)";
            }}
          >
            🔓 Logout
          </button>
        )}

        {/* Login button when not logged in */}
        {!isLoggedIn && (
          <button
            id="login-button-main"
            onClick={handleLoginClick}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 10000,
              padding: "10px 20px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease",
              fontFamily: "Arial, sans-serif"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#45a049";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#4CAF50";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
            }}
            onMouseDown={(e) => {
              e.target.style.background = "#3d8b40";
              e.target.style.transform = "translateY(1px)";
            }}
            onMouseUp={(e) => {
              e.target.style.background = "#45a049";
              e.target.style.transform = "translateY(-1px)";
            }}
          >
            🔑 Login to Edit
          </button>
        )}

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