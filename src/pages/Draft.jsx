import React, { useEffect, useState, useCallback } from "react";
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

const LOGIN_URL = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";
const AUTH_CHECK_INTERVAL = 30000; // 30 seconds

const Draft = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const memberId = location.state?.exporterData;
  const token = location.state?.token;

  const checkAuth = useCallback(() => {
    const sessionData = localStorage.getItem("sessionData");
    if (!sessionData) {
      // Clear any existing intervals
      if (window.authCheckInterval) {
        clearInterval(window.authCheckInterval);
      }
      // Redirect to 404 page
      window.location.href = '/404';
      return false;
    }
    return true;
  }, []);

  const {
    data: rejectSectionData,
    error: sectionError,
    isLoading,
  } = useQuery({
    queryKey: ["get-reject-section", memberId],
    queryFn: () => getRejectionSection(memberId),
    enabled: !!memberId,
  });
  const [userData, setUserData] = useState(null);

  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem("sessionData");
    if (!stored) {
      window.location.href = '/404';
      return null;
    }
    return JSON.parse(stored);
  });

  useEffect(() => {
    // Initial auth check
    if (!checkAuth()) return;

    // Set up periodic auth check
    window.authCheckInterval = setInterval(checkAuth, AUTH_CHECK_INTERVAL);

    const handleStorageChange = (event) => {
      if (event.key === "sessionData") {
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        setCustomer(newData);
        if (!newData) {
          // Clear the interval
          if (window.authCheckInterval) {
            clearInterval(window.authCheckInterval);
          }
          // Close the tab after a short delay
          setTimeout(() => {
            window.location.replace(LOGIN_URL);
          }, 150);
        }
      }
    };

    // Listen for localStorage changes
    window.addEventListener("storage", handleStorageChange);

    // Cleanup function
    return () => {
      if (window.authCheckInterval) {
        clearInterval(window.authCheckInterval);
      }
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkAuth]);

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

  if (!customer || customer?.member_name === undefined || customer?.member_name !== rejectSectionData?.company_name) {
    window.location.href = '/404';
    return null;
  }

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
          memberId={memberId.memberId}
          token={token}
          website_url={memberId.website_url}
          rejectionNumbers={rejectSection}
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
