import React, { useEffect, useRef, useState, useMemo } from "react";
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

const secretKey = "fgghw53ujf8836d";
const LOGIN_URL = "https://eepc-exporter-home-page-v2-whhx.vercel.app/auth/login";

const Live = () => {
  // Check for edit mode in URL
  const isEditMode = window.location.pathname.includes('/edit');
  
  // ✅ Persisted Set (shared across event calls)
  const companySetRef = useRef(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem("sessionData");
    return stored ? JSON.parse(stored) : null;
  });
  
  // Check if current user is a member
  const isMember = useMemo(() => {
    return customer?.role === 'member' || !customer?.isAdmin;
  }, [customer]);
  
  // Redirect to login if in edit mode without authentication
  useEffect(() => {
    if (isEditMode && !customer) {
      // Clear any existing session data
      localStorage.removeItem('sessionData');
      localStorage.removeItem('isValidToken');
      // Redirect to login
      window.location.href = '/auth/login';
      return;
    }
    
    // If we have a customer, verify the token
    if (customer) {
      try {
        // Verify token expiration
        const currentTime = Date.now() / 1000;
        if (customer.exp && customer.exp < currentTime) {
          // Token expired
          localStorage.removeItem('sessionData');
          localStorage.removeItem('isValidToken');
          if (isEditMode) {
            window.location.href = '/auth/login';
          }
        } else {
          // Token is valid
          localStorage.setItem('isValidToken', 'true');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('sessionData');
        localStorage.removeItem('isValidToken');
        if (isEditMode) {
          window.location.href = '/auth/login';
        }
      }
    }
  }, [customer, isEditMode]);

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

  // Close/redirect this tab when the user logs out (sessionData removed elsewhere).
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

        if (storedData && storedData.trim() !== '') {
          try {
            const decryptedBytes = CryptoJS.AES.decrypt(storedData, secretKey);
            const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (decryptedText && decryptedText.trim() !== '') {
              try {
                decryptedData = JSON.parse(decryptedText);
              } catch (parseError) {
                console.error("❌ Error parsing decrypted data:", parseError);
                console.log("Decrypted text that caused error:", decryptedText);
                decryptedData = {}; // Initialize as empty object if parsing fails
              }
            } else {
              console.warn("Decryption resulted in empty or invalid text");
              decryptedData = {};
            }
          } catch (err) {
            console.error("❌ Error decrypting localStorage data:", err);
            decryptedData = {}; // Ensure we always have a valid object
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
  // Show loading state or redirect based on auth status
  if (isLoading) {
    if (isEditMode && !customer) {
      // If we're still loading but we know we need to be logged in, show a loading state
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }
    return null;
  }

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
                "https://eepc-exporter-home-page-v2-whhx.vercel.app/dashboard/exporter-home-page")
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
        <MapReviewLive 
          website_url={website_url} 
          isAdmin={isAdmin} 
          isMember={isMember}
        />
      </div>
      
      <ChatWidget website_url={website_url} isAdmin={isAdmin} isMember={isMember} />
      <WhatsAppPopUp website_url={website_url} />
      <FooterLive website_url={website_url} />
    </>
  );
};

export default Live;
