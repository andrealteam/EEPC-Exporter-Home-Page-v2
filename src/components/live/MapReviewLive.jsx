import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState, useMemo } from "react";
import { checkMemberRestrictions, isMember } from "../../utils/userRoles";
import { getAddress } from "../../services/draftApi";
import Skeleton from "react-loading-skeleton";
import { getLiveAddress, postGetInTouch } from "../../services/liveApi";
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
  const {
    data: addressData,
    isLoading,
    isError,
    error: addressError,
  } = useQuery({
    queryKey: ["map-review-live", website_url],
    queryFn: () => getLiveAddress(website_url),
  });

  useEffect(() => {
    const loadData = () => {
      const storedData = localStorage.getItem(website_url);
      if (storedData) {
        const decryptedBytes = CryptoJS.AES.decrypt(storedData, secretKey);
        const decryptedData = JSON.parse(
          decryptedBytes.toString(CryptoJS.enc.Utf8)
        );
        // const parsedData = JSON.parse(storedData);
        setName(decryptedData.name || "");
        setEmail(decryptedData.email || "");
        setPhone(decryptedData.phone || "");
      }
    };

    // pehle load
    loadData();

    // listener lagao
    window.addEventListener("localStorageUpdated", loadData);

    return () => {
      window.removeEventListener("localStorageUpdated", loadData);
    };
  }, [website_url]);

  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent admin from submitting reviews
    if (isAdmin) {
      toast.error("Admins cannot submit reviews");
      return;
    }
    
    // Check if user is a member trying to submit a review
    if (checkMemberRestrictions('review')) {
      return; // Stop the submission if member
    }
    
    const formData = {
      website_url,
      name: modalName || name,
      email: modalEmail || email,
      phone: modalPhone || phone,
      message,
    };
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
        // localStorage.setItem(website_url, JSON.stringify(savedData));

        // 👇 localStorage set karne ke baad turant state update
        setName(savedData.name);
        setEmail(savedData.email);
        setPhone(savedData.phone);

        // custom event dispatch
        window.dispatchEvent(new Event("localStorageUpdated"));
      }

      toast.success(res?.message);
      setModalName("");
      setModalEmail("");
      setModalPhone("");
      setMessages("");
    } else {
      setModalName("");
      setModalEmail("");
      setModalPhone("");
      setMessages("");

      toast.error(res?.message || "Error submitting review");
    }
  };

  const maxWords = 150;

  const handleTestimonialChange = (e) => {
    let text = e.target.value;

    // Words split karke count karte hai
    let words = text.trim().split(/\s+/);

    if (words.length > maxWords) {
      // 200 words tak hi allow karenge
      text = words.slice(0, maxWords).join(" ");
    }

    setMessages(text);
  };

  // Encode the address for URL safety
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    addressData?.address || ''
  )}&output=embed`;
  
  // Check if user is a member
  const user = JSON.parse(localStorage.getItem("sessionData") || '{}');
  const isUserMember = isMemberProp || isMember(user);

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
      {addressData?.address && (
        <div className="contact-map">
          <iframe
            title="Location Map"
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default MapReviewLive;
