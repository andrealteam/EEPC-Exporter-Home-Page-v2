import { useQuery } from "@tanstack/react-query";
import { jwtVerify } from "jose";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSection } from "../services/draftApi";
import HeaderPreview from "../components/preview/HeaderPreview";
import BannerPreview from "../components/preview/BannerPreview";
import AboutPreview from "../components/preview/AboutPreview";
import WhoWeArePreview from "../components/preview/WhoWeArePreview";
import ProductsPreview from "../components/preview/ProductsPreview";
import FooterPreview from "../components/preview/FooterPreview";
import CertificatePreview from "../components/preview/CertificatePreview";
import AwardsPreview from "../components/preview/AwardsPreview";
import TestimonialsPreview from "../components/preview/TestimonialsPreview";
import GalleryPreview from "../components/preview/GalleryPreview";
import ParticipationPreview from "../components/preview/ParticipationPreview";
import MapReview from "../components/draft/MapReview";

const LOGIN_URL = "https://prodis.eepcindia.org/auth/login";

const Preview = () => {
  const [member, setMember] = useState(null);
  const { token } = useParams();

  const secret = new TextEncoder().encode("fgghw53ujf8836d");

  const {
    data: sectionData = [],
    isLoading: sectionLoading,
    error: sectionError,
  } = useQuery({
    queryKey: ["get-section", member?.memberId, token],
    queryFn: () => getSection(member?.memberId),
    enabled: !!member?.memberId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    onError: (err) => console.error("Error fetching sections:", err),
  });

  const verifyToken = async (token) => {
    try {
      const { payload } = await jwtVerify(token, secret);
      if (!payload.memberId) {
        localStorage.removeItem('isValidToken');
        return null;
      }
      // Store that we have a valid token
      localStorage.setItem('isValidToken', 'true');
      return { memberId: payload.memberId, ...payload };
    } catch (err) {
      console.error("Token verification failed:", err);
      localStorage.removeItem('isValidToken');
      return null;
    }
  };

  useEffect(() => {
    const verifyAndSetMember = async () => {
      if (!token) {
        window.location.replace("https://prodis.eepcindia.org/auth/login");
        return;
      }

      const payload = await verifyToken(token);

      if (!payload?.memberId) {
        window.location.replace("https://prodis.eepcindia.org/auth/login");
        return;
      }

      setMember(payload);
    };

    verifyAndSetMember();
  }, [token]);

  // Close/redirect this tab when sessionData is removed in another tab.
  useEffect(() => {
    const handleLogout = (event) => {
      if (event && event.key && event.key !== "sessionData") return;
      if (localStorage.getItem("sessionData")) return;

      window.close();
      setTimeout(() => {
        window.location.replace(LOGIN_URL);
      }, 150);
    };

    window.addEventListener("storage", handleLogout);
    return () => window.removeEventListener("storage", handleLogout);
  }, []);

  if (!member) {
    // If we've already determined the token is invalid, show 404
    if (token && !localStorage.getItem('isValidToken')) {
      // Force a hard navigation to 404
      window.location.href = '/404';
      return null;
    }
    
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p>Verifying your access token...</p>
      </div>
    );
  }

  if (sectionLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading preview content...
      </div>
    );
  }

  if (sectionError || !sectionData || sectionData?.message === "Member Sections not found") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <p style={{ fontSize: "20px" }}>Content not available right now. Please try again.</p>
      </div>
    );
  }

  if (Array.isArray(sectionData) && sectionData.length > 0) {
    return (
      <>
        <div className="container">
          <HeaderPreview memberId={member.memberId} />

          {sectionData.includes(11) && <ParticipationPreview memberId={member.memberId} />}
          {sectionData.includes(2) && <BannerPreview memberId={member.memberId} />}
          {sectionData.includes(3) && <AboutPreview memberId={member.memberId} />}
          {sectionData.includes(4) && <WhoWeArePreview memberId={member.memberId} />}
          {sectionData.includes(7) && <CertificatePreview memberId={member.memberId} />}
          {sectionData.includes(9) && <AwardsPreview memberId={member.memberId} />}
          {sectionData.includes(8) && <TestimonialsPreview memberId={member.memberId} />}
          {sectionData.includes(10) && <GalleryPreview memberId={member.memberId} />}

          <ProductsPreview memberId={member.memberId} />

          <MapReview memberId={member.memberId} />
        </div>

        <FooterPreview memberId={member.memberId} />
      </>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h2>No Content Available</h2>
      <p>This member has not set up their content yet.</p>
    </div>
  );
};

export default Preview;
