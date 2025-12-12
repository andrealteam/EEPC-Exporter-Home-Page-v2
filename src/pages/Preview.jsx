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

const Preview = () => {
  const [member, setMember] = useState(null);
  const [isSessionValid, setIsSessionValid] = useState(true);
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
      if (!payload.memberId) return null;
      return { memberId: payload.memberId, ...payload };
    } catch (err) {
      console.error("Token verification failed:", err);
      return null;
    }
  };

  // Ensure session exists; if removed (logout), show 404 immediately.
  useEffect(() => {
    const session = localStorage.getItem("sessionData");
    if (!session) {
      setIsSessionValid(false);
      setMember(null);
    }

    const handleStorage = (e) => {
      if (e.key === "sessionData" && !e.newValue) {
        setIsSessionValid(false);
        setMember(null);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const verifyAndSetMember = async () => {
      if (!token || !isSessionValid) {
        setMember(null);
        return;
      }

      const payload = await verifyToken(token);

      if (!payload?.memberId) {
        setMember(null);
        return;
      }

      setMember(payload);
    };

    verifyAndSetMember();
  }, [token, isSessionValid]);

  if (!member || !isSessionValid) {
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
        <h1 style={{ fontSize: "100px" }}>404</h1>
        <p style={{ fontSize: "22px" }}>Page Not Found</p>
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
        <h1 style={{ fontSize: "100px" }}>404</h1>
        <p style={{ fontSize: "22px" }}>Page Not Found</p>
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
