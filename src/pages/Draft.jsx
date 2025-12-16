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
  const [userData, setUserData] = useState(null);

  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem("sessionData");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "sessionData") {
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        setCustomer(newData);
        
        // If sessionData is cleared, also clear draft editor session
        if (!newData) {
          localStorage.removeItem("draft_editor_session");
          localStorage.setItem("isValidToken", "false");
        }
      }
      
      // Also listen for logout events
      if (event.key === "loggedInUserName" && !event.newValue) {
        // Clear draft session on logout
        localStorage.removeItem("draft_editor_session");
        localStorage.setItem("isValidToken", "false");
      }
    };

    // Listen for localStorage changes
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

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
    </>
  );
};

export default Draft;