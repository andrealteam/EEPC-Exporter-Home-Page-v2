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

  // 🔹 Primary admin detection from localStorage and sessionData
  useEffect(() => {
    const checkAdminStatus = () => {
      let isAdminDetected = false;
      
      // 1. Check encrypted localStorage data
      const storedData = localStorage.getItem(website_url);
      if (storedData) {
        try {
          const decryptedBytes = CryptoJS.AES.decrypt(storedData, secretKey);
          const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
          if (decryptedText) {
            const decryptedData = JSON.parse(decryptedText);
            const adminStoreCompany = decryptedData?.adminCompany || "";
            
            if (adminStoreCompany && sectionData?.company && 
                adminStoreCompany === sectionData?.company) {
              isAdminDetected = true;
            }
          }
        } catch (error) {
          console.error("❌ Error decrypting data:", error);
        }
      }
      
      // 2. Check sessionData (fallback when cache is cleared)
      const sessionData = localStorage.getItem("sessionData");
      if (sessionData && sectionData?.company) {
        try {
          const session = JSON.parse(sessionData);
          if (session?.member_name && session.member_name === sectionData?.company) {
            isAdminDetected = true;
          }
        } catch (e) {
          console.error("Error parsing sessionData:", e);
        }
      }
      
      // 3. Check companySet (another fallback)
      if (sectionData?.company && companySetRef.current.has(sectionData.company)) {
        isAdminDetected = true;
      }
      
      setIsAdmin(isAdminDetected);
    };
    
    checkAdminStatus();
  }, [sectionData, website_url]);

  // 🔹 Handle window.message events for admin detection
  useEffect(() => {
    const allowedOrigin = "https://www.eepcindia.org";
    
    function onMessage(event) {
      if (event.origin !== allowedOrigin) return;

      const data = event.data;

      if (data.Rdata) {
        // Get existing data from localStorage
        const storedData = localStorage.getItem(website_url);
        let decryptedData = {};
        
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

        // Merge old + new data
        const mergedData = {
          ...decryptedData,
          ...data.Rdata,
        };

        // Check admin status from Rdata
        const adminCompany = data.Rdata?.adminCompany;
        const memberName = data.Rdata?.member_name;
        const currentCompany = sectionData?.company;
        
        if ((adminCompany && adminCompany === currentCompany) || 
            (memberName && memberName === currentCompany)) {
          setIsAdmin(true);
        }
        
        // Save merged data to localStorage
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(mergedData),
          secretKey
        ).toString();
        localStorage.setItem(website_url, encrypted);
        
        window.dispatchEvent(new Event("localStorageUpdated"));
      }

      // Direct admin flag from message
      if (data.isAdmin !== undefined) {
        setIsAdmin(data.isAdmin);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sectionData, website_url]);

  // ✅ Restore the Set from localStorage when the component mounts
  useEffect(() => {
    const savedSet = localStorage.getItem("companySet");
    if (savedSet) {
      try {
        const parsed = JSON.parse(savedSet);
        companySetRef.current = new Set(parsed);
        
        // If the restored Set already contains the company, mark as admin
        if (sectionData?.company && companySetRef.current.has(sectionData.company)) {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error("Error parsing companySet:", e);
      }
    }
  }, [sectionData]);

  // 🔹 Listen for sessionData changes (for admin detection)
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
          
          // Check if this is the admin
          if (newData.member_name === sectionData?.company) {
            setIsAdmin(true);
          }
        }

        if (newData?.member_name &&
            (newData.member_name === sectionData?.company ||
             companySetRef.current.has(sectionData?.company))) {
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
                "https://eepc-exporter-home-page.vercel.app/dashboard/exporter-home-page")
            }
          >
            Renew Now
          </button>
        </div>
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
          color: "#333",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "100px", margin: 0 }}>404</h1>
        <p style={{ fontSize: "24px", marginBottom: "20px" }}>Page Not Found</p>
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