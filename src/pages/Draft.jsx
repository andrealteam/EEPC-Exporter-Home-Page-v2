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

const LOGIN_URL =
  "https://eepc-exporter-home-page-v2.vercel.app/auth/login";

/* 🔒 LOCK EDITING */
const lockEditing = () => {
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.disabled = true;
    el.readOnly = true;
  });

  document.querySelectorAll('[contenteditable="true"]').forEach((el) => {
    el.setAttribute("contenteditable", "false");
  });

  document.body.style.pointerEvents = "none";
  document.body.style.userSelect = "none";
  document.body.style.opacity = "0.6";
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

  /* 🧠 INITIAL SESSION CHECK (NO LOCK HERE) */
  useEffect(() => {
    const session = localStorage.getItem("sessionData");
    if (session) {
      hadSessionRef.current = true;
    }
  }, []);

  /* 🚨 LOGOUT DETECTOR (ONLY AFTER LOGIN) */
  const handleLogout = () => {
    if (!hadSessionRef.current) return;
    if (isLockedRef.current) return;

    isLockedRef.current = true;
    lockEditing();

    setTimeout(() => {
      window.location.replace(LOGIN_URL);
    }, 300);
  };

  /* ✅ CROSS-TAB LOGOUT */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "sessionData" && !e.newValue) {
        handleLogout();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ✅ SAME TAB / VISIBILITY / FOCUS */
  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem("sessionData");
      if (!session) {
        handleLogout();
      }
    };

    window.addEventListener("focus", checkSession);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    });

    const interval = setInterval(checkSession, 2000);

    return () => {
      window.removeEventListener("focus", checkSession);
      clearInterval(interval);
    };
  }, []);

  const rejectSection =
    rejectSectionData?.rejected_sections || [];
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
