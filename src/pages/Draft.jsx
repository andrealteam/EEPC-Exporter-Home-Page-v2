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

/* 🔒 LOCK EDITING FUNCTION */
const lockEditing = () => {
  console.log("Locking editing...");
  
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
    if (!el.id?.includes("logout") && !el.id?.includes("exit")) {
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
        <div style="font-weight: bold;">Session Expired - View Only Mode</div>
        <button onclick="window.location.href='${LOGIN_URL}'" 
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
  }
};

/* 🔓 UNLOCK EDITING FUNCTION */
const unlockEditing = () => {
  console.log("Unlocking editing...");
  
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
  
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem("sessionData");
    return stored ? JSON.parse(stored) : null;
  });
  const [isEditingLocked, setIsEditingLocked] = useState(false);

  useEffect(() => {
    // Check initial state
    const checkAndSetEditing = () => {
      const hasValidSession = customer?.member_name && 
                            customer?.member_name === rejectSectionData?.company_name;
      
      if (hasValidSession) {
        unlockEditing();
        setIsEditingLocked(false);
      } else {
        lockEditing();
        setIsEditingLocked(true);
      }
    };
    
    // Initial check
    if (rejectSectionData) {
      checkAndSetEditing();
    }
  }, [customer, rejectSectionData]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "sessionData") {
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        setCustomer(newData);
        
        if (!newData) {
          // Session removed - lock editing but don't redirect immediately
          lockEditing();
          setIsEditingLocked(true);
          
          // Optional: Auto-redirect after delay
          setTimeout(() => {
            window.location.replace(LOGIN_URL);
          }, 5000);
        } else {
          // New session added - check if it's valid for this draft
          const isValid = newData.member_name === rejectSectionData?.company_name;
          if (isValid) {
            unlockEditing();
            setIsEditingLocked(false);
          } else {
            lockEditing();
            setIsEditingLocked(true);
          }
        }
      }
    };

    // Listen for localStorage changes
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically
    const interval = setInterval(() => {
      const stored = localStorage.getItem("sessionData");
      const currentCustomer = stored ? JSON.parse(stored) : null;
      
      if (!currentCustomer && !isEditingLocked) {
        lockEditing();
        setIsEditingLocked(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [rejectSectionData, isEditingLocked]);

  // Check permission when component renders
  useEffect(() => {
    if (customer && rejectSectionData) {
      const hasPermission = customer.member_name === rejectSectionData.company_name;
      
      if (!hasPermission) {
        // User doesn't have permission - lock editing
        lockEditing();
        setIsEditingLocked(true);
      } else {
        // User has permission - unlock editing
        unlockEditing();
        setIsEditingLocked(false);
      }
    }
  }, [customer, rejectSectionData]);

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

  return (
    <ChangeTrackerProvider>
      <div className="container">
        {/* Show a message if in view-only mode */}
        {isEditingLocked && (
          <div style={{
            position: "fixed",
            top: "60px",
            right: "20px",
            background: "#ff4444",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            zIndex: 9999,
            fontSize: "14px",
            fontWeight: "bold",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            View Only Mode
          </div>
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
          isLocked={isEditingLocked} // Pass lock status to PreviewPublish
        />

        {/* 1 */}
        <HeaderDraft memberId={memberId.memberId} />

        <ParticipationDraft memberId={memberId.memberId} />

        {/* 2 */}
        <BannerDraft memberId={memberId.memberId} />

        {/* <CertificateDraft memberId={memberId.memberId} /> */}
        {/* <AwardsDraft memberId={memberId.memberId} /> */}
        {/* <Testimonials memberId={memberId.memberId} /> */}
        {/* <GalleryDraft memberId={memberId.memberId} /> */}

        {/* 4 */}
        <AboutDraft memberId={memberId.memberId} />
        {/* <WhoWeAreDraft memberId={memberId.memberId} /> */}

        {/* 5 */}
        <ProductsDraft memberId={memberId.memberId} />

        <Testimonials memberId={memberId.memberId} />

        <MapReview memberId={memberId.memberId} />
      </div>
      <FooterDraft memberId={memberId.memberId} />
    </ChangeTrackerProvider>
  );
};

export default Draft;