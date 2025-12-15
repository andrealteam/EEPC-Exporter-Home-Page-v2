import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuth } from "../context/AuthContext";

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

const Draft = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const memberData = location.state?.exporterData;
  const token = location.state?.token;

  /* ======================================================
     🔐 AUTH + LOGOUT PROTECTION
  ====================================================== */

  // 1️⃣ Initial auth validation
  useEffect(() => {
    const role = Cookies.get("role");
    const memberCookie = Cookies.get("member_id");

    if (!user || !role || !memberCookie || !memberData?.memberId) {
      navigate("/404", { replace: true });
    }
  }, [user, memberData, navigate]);

  // 2️⃣ Auto-close Draft if logout happens in another tab
  useEffect(() => {
    const interval = setInterval(() => {
      if (!Cookies.get("role")) {
        navigate("/404", { replace: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  // 3️⃣ Listen to localStorage logout sync
  useEffect(() => {
    const handleStorageChange = () => {
      if (!Cookies.get("role")) {
        navigate("/404", { replace: true });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () =>
      window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  // ⛔ Block rendering until auth validated
  if (!user || !memberData?.memberId) return null;

  /* ======================================================
     🔁 EXISTING LOGIC (UNCHANGED)
  ====================================================== */

  const {
    data: rejectSectionData,
    error: sectionError,
    isLoading,
  } = useQuery({
    queryKey: ["get-reject-section", memberData.memberId],
    queryFn: () => getRejectionSection(memberData.memberId),
    enabled: !!memberData?.memberId,
  });

  const rejectSection = rejectSectionData?.rejected_sections || [];
  const rejectMsg = rejectSectionData?.reject_message || "";

  return (
    <>
      <div className="container">
        {rejectMsg.length > 0 && (
          <RejectSectionBanner
            rejectionNumbers={rejectSection}
            rejectMsg={rejectMsg}
          />
        )}

        <PreviewPublish
          memberId={memberData.memberId}
          token={token}
          website_url={memberData.website_url}
          rejectionNumbers={rejectSection}
        />

        {/* Header */}
        <HeaderDraft memberId={memberData.memberId} />

        {/* Participation */}
        <ParticipationDraft memberId={memberData.memberId} />

        {/* Banner */}
        <BannerDraft memberId={memberData.memberId} />

        {/* About */}
        <AboutDraft memberId={memberData.memberId} />

        {/* Products */}
        <ProductsDraft memberId={memberData.memberId} />

        {/* Testimonials */}
        <Testimonials memberId={memberData.memberId} />

        {/* Map */}
        <MapReview memberId={memberData.memberId} />
      </div>

      {/* Footer */}
      <FooterDraft memberId={memberData.memberId} />
    </>
  );
};

export default Draft;
