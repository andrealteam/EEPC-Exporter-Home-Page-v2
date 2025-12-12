import React, { useEffect, useRef, useState } from "react";
import HeaderLive from "../components/live/HeaderLive";
import BannerLive from "../components/live/BannerLive";
import AboutLive from "../components/live/AboutLive";
import WhoWeAreLive from "../components/live/WhoWeAreLive";
import ProductsLive from "../components/live/ProductsLive";
import FooterLive from "../components/live/FooterLive";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLiveSection } from "../services/liveApi";
import CertificateLive from "../components/live/CertificateLive";
import AwardsLive from "../components/live/AwardsLive";
import TestimonialLive from "../components/live/TestimonialLive";
import GalleryLive from "../components/live/GalleryLive";
import ParticipationLIve from "../components/live/ParticipationLIve";
import ChatWidget from "../components/live/ChatWidget";
import WhatsAppPopUp from "../components/live/WhatsAppPopUp";
import MapReviewLive from "../components/live/MapReviewLive";
import CryptoJS from "crypto-js";

const secretKey = "my-secret-key";

const Live = () => {
  // ✅ Persisted Set (shared across event calls)
  const companySetRef = useRef(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem("sessionData");
    return stored ? JSON.parse(stored) : null;
  });
  const [isSessionValid, setIsSessionValid] = useState(true);

  const { website_url } = useParams();
  const {
    data: sectionData,
    error: sectionError,
    isLoading,
  } = useQuery({
    queryKey: ["get-section", website_url],
    queryFn: () => getLiveSection(website_url),
    enabled: !!website_url,
  });

  // Block access when session is removed (logout) even on refresh.
  useEffect(() => {
    const session = localStorage.getItem("sessionData");
    if (!session) {
      setIsSessionValid(false);
    }

    const handleStorage = (e) => {
      if (e.key === "sessionData" && !e.newValue) {
        setIsSessionValid(false);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    // const storedData = localStorage.getItem(website_url);

    const storedData = localStorage.getItem(website_url);
    let decryptedData = {}; // declare outside so it’s accessible later

    if (storedData) {
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(storedData, secretKey);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (decryptedText) {
          decryptedData = JSON.parse(decryptedText);
        }
      } catch (error) {
        console.error("❌ Error decrypting data:", error);
      }
    }

    // ✅ Get adminCompany safely
    let adminStoreCompany = decryptedData?.adminCompany || "";

    if (storedData) {
      // let data = JSON.parse(storedData);
      adminStoreCompany = decryptedData?.adminCompany;
    }

    if (
      adminStoreCompany &&
      sectionData?.company &&
      adminStoreCompany === sectionData?.company
    ) {
      setIsAdmin(true);
    }
  }, [sectionData]);

  useEffect(() => {
    const allowedOrigin =
      // "https://www.eepcindia.org";
      "https://www.eepcindia.org";

    function onMessage(event) {
      if (event.origin !== allowedOrigin) return;

      const data = event.data;

      if (data.Rdata) {
        // 🔹 Get old data from localStorage (if any)
        // const existingData =
        //   JSON.parse(localStorage.getItem(website_url)) || {};
        const storedData = localStorage.getItem(website_url);

        let decryptedData = {}; // use let instead of const

        if (storedData) {
          try {
            const decryptedBytes = CryptoJS.AES.decrypt(storedData, secretKey);
            const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (decryptedText) {
              decryptedData = JSON.parse(decryptedText);
            }
          } catch (err) {
            console.error("❌ Error decrypting localStorage data:", err);
          }
        }

        // 🔹 Merge old + new data (new data overwrites old only for matching keys)
        const mergedData = {
          ...decryptedData,
          ...data.Rdata,
        };

        if (
          data.Rdata?.adminCompany !== "" &&
          data.Rdata?.adminCompany === sectionData?.company
        ) {
          setIsAdmin(true);
        }
        // 🔹 Save merged data to localStorage

        // Encrypt before saving
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(mergedData),
          secretKey
        ).toString();
        localStorage.setItem(website_url, encrypted);

        // localStorage.setItem(website_url, JSON.stringify(mergedData));

        window.dispatchEvent(new Event("localStorageUpdated"));
      }

      if (data.isAdmin !== undefined) {
        // handle admin logic
        setIsAdmin(true);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sectionData]);

  // ✅ Restore the Set from localStorage when the component mounts
  useEffect(() => {
    const savedSet = localStorage.getItem("companySet");
    if (savedSet) {
      const parsed = JSON.parse(savedSet);
      companySetRef.current = new Set(parsed);
    }

    // If the restored Set already contains the company, mark as admin
    if (
      sectionData?.company &&
      companySetRef.current.has(sectionData.company)
    ) {
      setIsAdmin(true);
    }
  }, [sectionData]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "sessionData") {
        const newData = event.newValue ? JSON.parse(event.newValue) : null;

        if (newData?.member_name) {
          companySetRef.current.add(newData.member_name);

          // ✅ Save updated set to localStorage
          localStorage.setItem(
            "companySet",
            JSON.stringify(Array.from(companySetRef.current))
          );
        }

        if (
          newData?.member_name &&
          (newData.member_name === sectionData?.company ||
            companySetRef.current.has(sectionData?.company))
        ) {
          setIsAdmin(true);
        }

        setCustomer(newData);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [sectionData]);

  // Still loading, show nothing or loader
  if (isLoading) return null;

  // console.log("sectionError", sectionError);

  if (sectionData?.link_expire_status === "true") {
    return (
      <div className="overlay">
        <div className="expired-popup">
          <h2>Your website has expired</h2>
          <p>Please renew your website to continue using our services.</p>
          <button
            className="renew-btn"
            onClick={() =>
              (window.location.href =
                "https://eepc-exporter-home-page-v2.vercel.app/dashboard/exporter-home-page")
            }
          >
            Renew Now
          </button>
        </div>
      </div>
    );
  }

  if (!isSessionValid) {
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
        <h1 style={{ fontSize: "100px", margin: 0 }}>404</h1>
        <p style={{ fontSize: "22px", margin: 0 }}>Page Not Found</p>
      </div>
    );
  }

  if (
    sectionError ||
    !sectionData ||
    sectionData?.message === "Member Sections not found"
  ) {
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
        <p style={{ fontSize: "20px", margin: 0 }}>Content not available right now. Please try again.</p>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <HeaderLive website_url={website_url} />

        <ParticipationLIve member_id={sectionData?.member_id} />

        {sectionData?.data?.includes(2) && (
          <BannerLive
            website_url={website_url}
            isAdmin={isAdmin}
            member_id={sectionData?.member_id}
          />
        )}

        {sectionData?.data?.includes(3) && (
          <AboutLive website_url={website_url} />
        )}

        <ProductsLive website_url={website_url} />

        {/* {sectionData?.data?.includes(7) && (
          <CertificateLive website_url={website_url} />
        )} */}

        {/* {sectionData?.data?.includes(9) && (
          <AwardsLive website_url={website_url} />
        )} */}

        {sectionData?.data?.includes(8) && (
          <TestimonialLive website_url={website_url} />
        )}

        {/* {sectionData?.data?.includes(10) && (
          <GalleryLive website_url={website_url} />
        )} */}

        {/* {sectionData?.data?.includes(11) && ( */}
        {/* )} */}

        {/* {sectionData?.data?.includes(4) && (
          <WhoWeAreLive website_url={website_url} />
        )} */}
        <MapReviewLive website_url={website_url} isAdmin={isAdmin} />
      </div>
      <ChatWidget website_url={website_url} isAdmin={isAdmin} />
      <WhatsAppPopUp website_url={website_url} />
      <FooterLive website_url={website_url} />
    </>
  );
};

export default Live;
