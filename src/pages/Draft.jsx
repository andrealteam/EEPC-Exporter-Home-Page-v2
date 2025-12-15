import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
        <button id="login-button" 
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
    document.getElementById("login-button").onclick = () => {
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
  const [isEditingLocked, setIsEditingLocked] = useState(true); // Start as locked by default

  // Check session and set editing state
  useEffect(() => {
    const checkSessionAndSetEditing = () => {
      const stored = localStorage.getItem("sessionData");
      const currentCustomer = stored ? JSON.parse(stored) : null;
      
      if (currentCustomer && rejectSectionData) {
        // Check if logged in user matches this company
        const hasPermission = currentCustomer.member_name === rejectSectionData.company_name;
        
        if (hasPermission) {
          console.log("User has permission, unlocking editing");
          unlockEditing();
          setIsEditingLocked(false);
        } else {
          console.log("User doesn't have permission, locking editing");
          lockEditing();
          setIsEditingLocked(true);
        }
      } else {
        // No session or no data yet
        console.log("No session found, locking editing");
        lockEditing();
        setIsEditingLocked(true);
      }
    };

    // Check initially
    checkSessionAndSetEditing();
    
    // Set up interval to check every 2 seconds
    const interval = setInterval(checkSessionAndSetEditing, 2000);
    
    return () => clearInterval(interval);
  }, [rejectSectionData]);

  // Listen for storage changes (cross-tab logout)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "sessionData") {
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        setCustomer(newData);
        
        if (!newData) {
          // Session was removed (logout)
          console.log("Session removed via storage event, locking editing");
          lockEditing();
          setIsEditingLocked(true);
        } else {
          // Session was added or changed
          console.log("Session changed via storage event, checking permissions");
          // The interval will handle the permission check
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Check on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const stored = localStorage.getItem("sessionData");
        if (!stored) {
          console.log("No session on visibility change, locking editing");
          lockEditing();
          setIsEditingLocked(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Simple check - if no sessionData in localStorage, lock editing
  useEffect(() => {
    const handleNoSession = () => {
      const stored = localStorage.getItem("sessionData");
      if (!stored) {
        lockEditing();
        setIsEditingLocked(true);
      }
    };

    // Check on focus
    window.addEventListener('focus', handleNoSession);
    return () => window.removeEventListener('focus', handleNoSession);
  }, []);

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

  // Show loading while checking permissions
  if (isLoading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc"
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <ChangeTrackerProvider>
      <div className="container">
        {/* Show status indicator */}
        <div style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 9999,
          padding: "8px 16px",
          borderRadius: "4px",
          fontWeight: "bold",
          background: isEditingLocked ? "#ff4444" : "#4CAF50",
          color: "white",
          fontSize: "14px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
        }}>
          {isEditingLocked ? "🔒 View Only" : "✏️ Edit Mode"}
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