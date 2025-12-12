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

const Draft = () => {
  const location = useLocation();
  const memberId = location.state?.exporterData;
  const token = location.state?.token;
  const [isSessionValid, setIsSessionValid] = useState(true);

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

  // Invalidate immediately when the session is removed (logout).
  useEffect(() => {
    const session = localStorage.getItem("sessionData");
    if (!session) {
      setIsSessionValid(false);
    }

    const handleStorageChange = (event) => {
      if (event.key === "sessionData" && !event.newValue) {
        setIsSessionValid(false);
      }
      if (event.key === "sessionData") {
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        setCustomer(newData);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  let rejectSection = rejectSectionData?.rejected_sections || [];
  let rejectMsg = rejectSectionData?.reject_message || "";

  // if (
  //   customer?.member_name === undefined ||
  //   customer?.member_name !== rejectSectionData?.company_name
  // ) {
  //   return (
  //     <div
  //       style={{
  //         height: "100vh",
  //         display: "flex",
  //         flexDirection: "column",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         backgroundColor: "#f8fafc",
  //         color: "#1e293b",
  //         fontFamily: "Inter, sans-serif",
  //       }}
  //     >
  //       <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
  //         Session Expired
  //       </h2>
  //       <p
  //         style={{ fontSize: "1rem", color: "#64748b", marginBottom: "1.5rem" }}
  //       >
  //         Your session has expired or you are not authorized to access this
  //         page.
  //       </p>
  //       <button
  //         onClick={() =>
  //           (window.location.href =
  //             "https://eepc-exporter-home-page-v2.vercel.app/auth/login")
  //         }
  //         style={{
  //           padding: "10px 20px",
  //           backgroundColor: "#2563eb",
  //           color: "white",
  //           border: "none",
  //           borderRadius: "8px",
  //           cursor: "pointer",
  //           fontSize: "1rem",
  //           transition: "background-color 0.2s ease",
  //         }}
  //         onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
  //         onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
  //       >
  //         Go to Login
  //       </button>
  //     </div>
  //   );
  // }

  if (!isSessionValid) {
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
          404
        </h2>
        <p style={{ fontSize: "1rem", color: "#64748b", marginBottom: "1.5rem" }}>
          Page Not Found
        </p>
      </div>
    );
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
