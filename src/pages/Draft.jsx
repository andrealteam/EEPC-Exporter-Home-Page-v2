import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { HeaderDraft } from "../components";
import BannerDraft from "../components/draft/BannerDraft";
import AboutDraft from "../components/draft/AboutDraft";
import ProductsDraft from "../components/draft/productsDraft";
import FooterDraft from "../components/draft/FooterDraft";
import PreviewPublish from "../components/draft/PreviewPublish";
import Testimonials from "../components/draft/Testimonials";
import GalleryDraft from "../components/draft/GalleryDraft";
import ParticipationDraft from "../components/draft/ParticipationDraft";
import MapReview from "../components/draft/MapReview";
import RejectSectionBanner from "../components/draft/RejectSectionBanner";
import { useQuery } from "@tanstack/react-query";
import { getRejectionSection } from "../services/draftApi";
import { ChangeTrackerProvider } from "../contexts/ChangeTrackerContext";

const LOGIN_URL =
  "https://eepc-exporter-home-page-v2.vercel.app/auth/login";

/* 🔒 HARD LOCK FUNCTION — disables ALL editing */
const lockEditing = () => {
  // Disable form inputs
  document.querySelectorAll("input, textarea, select").forEach((el) => {
    el.disabled = true;
    el.readOnly = true;
  });

  // Disable contentEditable elements
  document.querySelectorAll('[contenteditable="true"]').forEach((el) => {
    el.setAttribute("contenteditable", "false");
  });

  // Block all mouse & keyboard interactions
  document.body.style.pointerEvents = "none";
  document.body.style.userSelect = "none";

  // Visual indication
  document.body.style.opacity = "0.6";
};

const Draft = () => {
  const location = useLocation();
  const memberId = location.state?.exporterData;
  const token = location.state?.token;

  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem("sessionData");
    return stored ? JSON.parse(stored) : null;
  });

  /* 🔐 API DATA */
  const { data: rejectSectionData } = useQuery({
    queryKey: ["get-reject-section", memberId],
    queryFn: () => getRejectionSection(memberId),
    enabled: !!memberId,
  });

  /* 🚨 Detect logout instantly (cross-tab + same tab) */
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "sessionData") {
        const newData = event.newValue
          ? JSON.parse(event.newValue)
          : null;

        setCustomer(newData);

        if (!newData) {
          lockEditing();
          setTimeout(() => {
            window.location.replace(LOGIN_URL);
          }, 300);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  /* 🔁 Refresh protection */
  useEffect(() => {
    if (!customer) {
      lockEditing();
      setTimeout(() => {
        window.location.replace(LOGIN_URL);
      }, 300);
    }
  }, [customer]);

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

        {/* HEADER */}
        <HeaderDraft memberId={memberId?.memberId} />

        {/* PARTICIPATION */}
        <ParticipationDraft memberId={memberId?.memberId} />

        {/* BANNER */}
        <BannerDraft memberId={memberId?.memberId} />

        {/* ABOUT */}
        <AboutDraft memberId={memberId?.memberId} />

        {/* PRODUCTS */}
        <ProductsDraft memberId={memberId?.memberId} />

        {/* TESTIMONIALS */}
        <Testimonials memberId={memberId?.memberId} />

        {/* MAP */}
        <MapReview memberId={memberId?.memberId} />
      </div>

      <FooterDraft memberId={memberId?.memberId} />
    </ChangeTrackerProvider>
  );
};

export default Draft;
