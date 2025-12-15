import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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
import { ChangeTrackerProvider } from "../contexts/ChangeTrackerContext";

const LOGIN_URL = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";

/* 🔒 LOCK EDITING - Enhanced function */
const lockEditing = () => {
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

  // Disable all links except logout/exit
  document.querySelectorAll("a").forEach((el) => {
    if (!el.href?.includes("logout") && !el.href?.includes(LOGIN_URL)) {
    }
  });

  // Visual indicators
  document.body.style.pointerEvents = "none";
  document.body.style.userSelect = "none";
  document.body.style.opacity = "0.7";
  document.body.style.cursor = "not-allowed";

  // Add a visual overlay
  const overlayId = "lock-editing-overlay";
  if (!document.getElementById(overlayId)) {
    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.zIndex = "9999";
    overlay.style.pointerEvents = "none";
    overlay.style.backgroundColor = "rgba(0,0,0,0.02)";
    document.body.appendChild(overlay);
  }

  // Add a notification message
  const messageId = "lock-editing-message";
  if (!document.getElementById(messageId)) {
    const message = document.createElement("div");
    message.id = messageId;
    message.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        text-align: center;
        border: 2px solid #ff4444;
        pointer-events: auto;
      ">
        <h3 style="color: #ff4444; margin-bottom: 10px;">Session Expired</h3>
        <p style="margin-bottom: 15px;">Your session has expired. Redirecting to login...</p>
        <button onclick="window.location.href='${LOGIN_URL}'" 
                style="
                  background: #ff4444;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                ">
          Go to Login
        </button>
      </div>
    `;
    document.body.appendChild(message);
  }
};

/* 🔓 UNLOCK EDITING - Add this function too */
const unlockEditing = () => {
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

  // Remove overlay and message
  const overlay = document.getElementById("lock-editing-overlay");
  if (overlay) overlay.remove();

  const message = document.getElementById("lock-editing-message");
  if (message) message.remove();
};

const Draft = () => {
  const location = useLocation();
  const memberId = location.state?.exporterData;
  const token = location.state?.token;

  const hadSessionRef = useRef(false);
  const isLockedRef = useRef(false);

  /* 🔐 API DATA */
  const { data: rejectSectionData } = useQuery({
    queryKey: ["get-reject-section", memberId],
    queryFn: () => getRejectionSection(memberId),
    enabled: !!memberId,
  });

  /* 🔍 CHECK SESSION ON MOUNT */
  useEffect(() => {
    const session = localStorage.getItem("sessionData");
    
    if (!session) {
      // No session on initial load - lock immediately
      isLockedRef.current = true;
      lockEditing();
      
      // Redirect to login after showing message
      setTimeout(() => {
        window.location.replace(LOGIN_URL);
      }, 3000);
    } else {
      hadSessionRef.current = true;
      // Ensure editing is unlocked when session exists
      unlockEditing();
    }
  }, []);

  /* 🚨 LOGOUT HANDLER */
  const handleLogout = () => {
    if (isLockedRef.current) return;
    
    isLockedRef.current = true;
    localStorage.removeItem("sessionData");
    lockEditing();

    // Redirect after a delay to show the message
    setTimeout(() => {
      window.location.replace(LOGIN_URL);
    }, 3000);
  };

  /* ✅ CROSS-TAB LOGOUT DETECTION */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "sessionData" && !e.newValue) {
        handleLogout();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ✅ SAME TAB / VISIBILITY / FOCUS CHECK */
  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem("sessionData");
      if (!session && hadSessionRef.current) {
        handleLogout();
      }
    };

    // Check on focus
    window.addEventListener("focus", checkSession);
    
    // Check on visibility change
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    });

    // Periodic check (every 2 seconds)
    const interval = setInterval(checkSession, 2000);

    return () => {
      window.removeEventListener("focus", checkSession);
      clearInterval(interval);
    };
  }, []);

  const rejectSection = rejectSectionData?.rejected_sections || [];
  const rejectMsg = rejectSectionData?.reject_message || "";

  return (
    <ChangeTrackerProvider>
      <div className="container">
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