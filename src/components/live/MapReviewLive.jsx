import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState, useMemo } from "react";
import { checkMemberRestrictions, isMember } from "../../utils/userRoles";
import { getAddress } from "../../services/draftApi";
import Skeleton from "react-loading-skeleton";
import { getLiveAddress, postGetInTouch } from "../../services/liveApi";
import { validateTokenOnServer } from "../../services/authApi";
import toast from "react-hot-toast";
import CryptoJS from "crypto-js";

const secretKey = "my-secret-key";

const MapReviewLive = ({ website_url, isAdmin, isMember: isMemberProp }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [message, setMessages] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isUserMember, setIsUserMember] = useState(false);
  
  const {
    data: addressData,
    isLoading: isLoadingAddress,
    isError,
    error: addressError,
  } = useQuery({
    queryKey: ["map-review-live", website_url],
    queryFn: () => getLiveAddress(website_url),
  });

  // Handle authentication state and token validation
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in URL first
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
          // Validate the token with the server
          const userData = await validateTokenOnServer(token);
          if (userData) {
            localStorage.setItem("sessionData", JSON.stringify(userData));
            setIsUserMember(isMember(userData));
            return;
          }
        }
        
        // If no token or invalid token, check localStorage
        const storedUser = localStorage.getItem("sessionData");
        const user = storedUser ? JSON.parse(storedUser) : {};
        setIsUserMember(isMember(user) || isMemberProp);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsUserMember(true); // Default to restricted access on error
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();
  }, [isMemberProp]);

  // Load saved form data
  useEffect(() => {
    const loadData = () => {
      const storedData = localStorage.getItem(website_url);
      if (storedData) {
        try {
          const decryptedBytes = CryptoJS.AES.decrypt(storedData, secretKey);
          const decryptedData = JSON.parse(
            decryptedBytes.toString(CryptoJS.enc.Utf8)
          );
          setName(decryptedData.name || "");
          setEmail(decryptedData.email || "");
          setPhone(decryptedData.phone || "");
        } catch (error) {
          console.error('Error decrypting stored data:', error);
        }
      }
    };

    loadData();
    window.addEventListener("localStorageUpdated", loadData);
    return () => {
      window.removeEventListener("localStorageUpdated", loadData);
    };
  }, [website_url]);

  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is a member trying to submit a review
    const isRestricted = await checkMemberRestrictions('review');
    if (isRestricted) {
      return; // Stop the submission if member or not logged in
    }
    
    const formData = {
      website_url,
      name: modalName || name,
      email: modalEmail || email,
      phone: modalPhone || phone,
      message,
    };
    
    try {
      let res = await postGetInTouch(formData, website_url);
      if (res.status) {
        if (!name || !email) {
          const savedData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          };

          const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(savedData),
            secretKey
          ).toString();

          localStorage.setItem(website_url, encrypted);
          setName(savedData.name);
          setEmail(savedData.email);
          setPhone(savedData.phone);
          window.dispatchEvent(new Event("localStorageUpdated"));
        }

        toast.success(res?.message || "Message sent successfully!");
        setModalName("");
        setModalEmail("");
        setModalPhone("");
        setMessages("");
      } else {
        throw new Error(res?.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Error submitting review");
    }
  };

  const maxWords = 150;

  const handleTestimonialChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/);
    
    if (words.length > maxWords) {
      const truncatedText = words.slice(0, maxWords).join(" ");
      setMessages(truncatedText);
      toast.error(`Maximum ${maxWords} words allowed`);
    } else {
      setMessages(text);
    }
  };

  // Encode the address for URL safety
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    addressData?.address || ''
  )}&output=embed`;
  
  // Show loading state while checking authentication
  if (isLoadingAuth) {
    return (
      <div className="contact-section">
        <div className="contact-form">
          <Skeleton height={50} count={5} />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="contact-section">
        <div className="contact-form">
          <Skeleton height={50} count={5} />
        </div>
        <div className="contact-map">
          <Skeleton height={300} />
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Error: {addressError.message}</div>;
  }

  // console.log("addressData", addressData);
  return (
    <div className="contact-section" style={{ marginTop: "60px" }}>
      <div className="contact-form" id="get-in-touch">
        <p className="small-text">write to us</p>
        <h2 className="title">Get In Touch</h2>

        {isUserMember && (
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            <p>You need to be logged in as a registered member to submit a review.</p>
          </div>
        )}
        <form onSubmit={handleSubmit} style={isUserMember ? { opacity: 0.6, pointerEvents: 'none' } : {}}>
          <input
            type="text"
            className="form-input"
            placeholder="Your full name"
            value={modalName || name}
            disabled={!!name || isAdmin}
            onChange={(e) => setModalName(e.target.value)}
            required
          />

          <input
            type="email"
            className="form-input"
            placeholder="Your E-Mail Address"
            value={modalEmail || email}
            disabled={!!email}
            onChange={(e) => setModalEmail(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="Phone (Optional)"
            value={modalPhone || phone}
            disabled={!!phone}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow numbers and limit to 10 digits
              if (value === '' || (/^\d{0,10}$/.test(value))) {
                setModalPhone(value);
              }
            }}
            maxLength="10"
            pattern="[0-9]{0,10}"
            title="Please enter a valid 10-digit phone number"
            className="form-input"
          />

          <textarea
            className="form-input"
            placeholder="Your Message"
            value={message}
            onChange={handleTestimonialChange}
            maxLength={maxWords * 5}
            rows={5}
          />

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={
              isAdmin ||
              isUserMember ||
              !(modalName || name) ||
              !(modalEmail || email) ||
              !message.trim()
            }
            style={{
              backgroundColor:
                isAdmin || isUserMember ||
                !(modalName || name) ||
                !(modalEmail || email) ||
                !message.trim()
                  ? "#ccc"
                  : "#0195a3",
              cursor:
                isAdmin || isUserMember ||
                !(modalName || name) ||
                !(modalEmail || email) ||
                !message.trim()
                  ? "not-allowed"
                  : "pointer",
              opacity:
                isAdmin || isUserMember ||
                !(modalName || name) ||
                !(modalEmail || email) ||
                !message.trim()
                  ? 0.7
                  : 1,
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              padding: "10px 15px",
              width: "100%",
              marginTop: "10px",
              fontSize: "16px",
              transition: "0.2s ease",
            }}
          >
            {isUserMember 
              ? "Reviews Disabled" 
              : isAdmin
                ? "Disabled for Admin"
                : !(modalName || name) || !(modalEmail || email) || !message.trim()
                  ? "Fill all required fields"
                  : "Send Enquiry"}
          </button>
        </form>
      </div>

      {/* <div className="contact-map">
        <h3 className="map-title">
          <span className="map-icon">📍</span> Locate us on map
        </h3>
        <div className="map-container">
          <iframe
            src={mapSrc}
            allowFullScreen=""
            loading="lazy"
            title="Google Map"
          ></iframe>
        </div>
      </div> */}
    </div>
  );
};

export default MapReviewLive;
