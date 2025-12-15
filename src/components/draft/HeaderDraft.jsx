import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { demoLogo } from "../../utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import { getHeader, postHeader } from "../../services/draftApi";
import {
  faEnvelopeOpen,
  faPen,
  faPhoneVolume,
} from "@fortawesome/free-solid-svg-icons";
import { baseFileURL } from "../../services/api";
import toast from "react-hot-toast";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faWhatsapp,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import Loader from "../Loader";
import Favicon from "../../utils/Favicon";
import { useChangeTracker } from "../../contexts/ChangeTrackerContext";
import { useNavigate } from "react-router-dom";

const HeaderDraft = ({ memberId }) => {
  const [openHeader, setOpenHeader] = useState(false);
  const [loading, setLoading] = useState(false);
  const { markAsChanged } = useChangeTracker();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('sessionData');
    localStorage.removeItem('isValidToken');
    
    // Clear any other relevant data
    localStorage.removeItem('changeTracker');
    
    // Navigate to login page
    window.location.href = 'https://eepc-exporter-home-page-v2.vercel.app/auth/login';
  };
    const {
    data: headerData = {},
    isLoading,
    isError,
    error: headerError,
  } = useQuery({
    queryKey: ["https://eepc-exporter-home-page-v2.vercel.app", memberId],
    queryFn: () => getHeader(memberId),
    enabled: !!memberId, // avoid firing before memberId exists
    placeholderData: {},
    onSuccess: (data) => {
      console.log('[useQuery] Header data loaded:', data);
    },
    onError: (error) => {
      console.error('[useQuery] Error fetching header:', error);
    }
  });


  
  console.log('[HeaderDraft] Current props:', { memberId });
  console.log('[HeaderDraft] Query state:', { headerData, isLoading, isError, headerError });

    const [editedHeader, setEditedHeader] = useState({
    logo: "",
    phone: "",
    email: "",
    logoFile: null,
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    whatsapp: "",
  });

  useEffect(() => {
    console.log('[useEffect] headerData changed:', headerData);
    
    if (headerData && Object.keys(headerData).length > 0) {
      console.log('[useEffect] Updating editedHeader with:', headerData);
      
      // Safely extract values with fallbacks
      const update = {
        phone: headerData.phone || "",
        email: headerData.email || "",
        facebook: headerData.facebook || "",
        twitter: headerData.twitter || "",
        instagram: headerData.instagram || "",
        linkedin: headerData.linkedin || "",
        whatsapp: headerData.whatsapp || "",
      };
      
      console.log('[useEffect] Update object:', update);
      setEditedHeader(prev => ({
        ...prev,
        ...update
      }));
    } else {
      console.log('[useEffect] No valid headerData received');
    }
  }, [headerData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedHeader((prev) => ({ ...prev, [name]: value }));
    markAsChanged(); // Mark as changed when any input is edited
  };

  const handleCancel = () => {
    setEditedHeader({
      logo: "",
      phone: headerData?.phone || "",
      email: headerData?.email || "",
      whatsapp: headerData?.whatsapp || "",
      logoFile: null,
    });
    setOpenHeader(false);
  };
  const queryClient = useQueryClient();
  const handleSave = async () => {
    // You can send editedHeader.logoFile to server if file was changed
    setLoading(true);
    let res = await postHeader(
      memberId,
      editedHeader.phone,
      editedHeader.email,
      editedHeader.logoFile,
      editedHeader.facebook,
      editedHeader.twitter,
      editedHeader.instagram,
      editedHeader.linkedin,
      editedHeader.whatsapp
    );
    if (res.status) {
      setLoading(false);
      toast.success(res?.message);
      queryClient.invalidateQueries(["https://eepc-exporter-home-page-v2.vercel.app", memberId]);
      setOpenHeader(false);
    } else {
      setLoading(false);
      toast.error(res?.message);
    }
  };

  if (isError)
    return <p>Error: {headerError.message || "Something went wrong!"}</p>;

  if (isLoading) {
    return <Skeleton height={80} />;
  }

  // If no memberId is provided, show a message
  if (!memberId) {
    return <p>No member ID provided. Please check your configuration.</p>;
  }

  return (
    <>
      {loading && <Loader isLoading={loading} />}
      {openHeader ? (
        <>
          <header
            className="header"
            style={{ position: "relative", paddingTop: "30px" }}
          >
            {/* Save/Cancel Buttons */}
            <div className="update-btn" style={{ zIndex: 9999 }}>
              <button className="edit-btn-2 btn-primary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="edit-btn-1 btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>

            <nav className="navbar navbar-expand-lg">
              <div className="container-fluid">
                {/* Editable Logo Upload */}
                <div className="navbar-brand">
                  <label className="file-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setEditedHeader((prev) => ({
                              ...prev,
                              logo: event.target.result, // base64 preview
                              logoFile: file, // actual file to upload later
                            }));
                            markAsChanged(); // Mark as changed when logo file is selected
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span>📁 Choose Image</span>
                  </label>

                  <img
                    src={
                      editedHeader.logo || 
                      (headerData?.logo ? `${baseFileURL}${headerData.logo}` : demoLogo)
                    }
                    alt="Logo"
                    width="120"
                    style={{ marginTop: "10px" }}
                    onError={(e) => {
                      e.target.src = demoLogo;
                    }}
                  />
                </div>

                {/* Editable Contact Info */}
                <div
                  className={`d-flex ms-auto ${
                    openHeader ? "open-header" : "close-header"
                  }`}
                  style={{ gap: "20px" }}
                >
                  <div className="contact-box">
                    <FontAwesomeIcon icon={faWhatsapp} />
                    <div className="call-text">
                      <span>WhatsApp Us:</span>
                      <input
                        type="text"
                        name="whatsapp"
                        value={editedHeader.whatsapp}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="contact-box">
                    <FontAwesomeIcon icon={faPhoneVolume} />
                    <div className="call-text">
                      <span>Call Us:</span>
                      <input
                        type="text"
                        name="phone"
                        value={editedHeader.phone}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="contact-box">
                    <FontAwesomeIcon icon={faEnvelopeOpen} />
                    <div className="call-text">
                      <span>Mail Us:</span>
                      <input
                        type="email"
                        name="email"
                        value={editedHeader.email}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </header>
        </>
      ) : (
        <header className="header" style={{ position: "relative" }}>
          <Favicon iconUrl={headerData?.logo ? baseFileURL + headerData?.logo : demoLogo} />

          <button
            className="update-btn"
            style={{ background: "", zIndex: 9999, top: "-12px" }}
            onClick={() => {
              // console.log("clicked");
              setOpenHeader(true);
            }}
          >
            <FontAwesomeIcon icon={faPen} />
          </button>

          <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
              {/* Logo */}
              <a className="navbar-brand" href="#">
                {isLoading ? (
                  <Skeleton width={120} />
                ) : (
                  <img
                    src={headerData?.logo ? baseFileURL + headerData?.logo : demoLogo}
                    alt="Logo"
                    width="120"
                    onError={(e) => {
                      e.target.src = demoLogo;
                    }}
                  />
                )}
              </a>

              {/* Right-side contact info */}
              <div
                className={`d-flex ms-auto ${
                  openHeader ? "open-header" : "close-header"
                }`}
              >
                <div className="contact-box">
                  <FontAwesomeIcon icon={faWhatsapp} />

                  <div className="call-text">
                    <span>WhatsApp Us:</span>
                    <a href={`tel:${headerData?.whatsapp}`}>
                      {headerData?.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="contact-box">
                  <FontAwesomeIcon icon={faPhoneVolume} />

                  <div className="call-text">
                    <span>Call Us:</span>
                    <a href={`tel:${headerData?.phone}`}>{headerData?.phone}</a>
                  </div>
                </div>
                <div className="contact-box">
                  <FontAwesomeIcon icon={faEnvelopeOpen} />

                  <div className="call-text">
                    <span>Mail Us:</span>
                    <a href={`mailto:${headerData?.email}`}>
                      {headerData?.email}
                    </a>
                  </div>
                </div>

                {/* <div class="container d-flex justify-content-between align-items-center">
                  <div style={{ display: "flex", gap: "10px" }}>
                    <a href={headerData?.facebook} class="">
                      <FontAwesomeIcon
                        icon={faFacebook}
                        style={{ fontSize: "30px" }}
                      />
                    </a>
                    <a href={headerData?.twitter} class="">
                      <FontAwesomeIcon
                        icon={faXTwitter}
                        style={{ fontSize: "30px" }}
                      />
                    </a>
                    <a href={headerData?.instagram} class="">
                      <FontAwesomeIcon
                        icon={faInstagram}
                        style={{ fontSize: "30px" }}
                      />
                    </a>
                    <a href={headerData?.linkedin} class="">
                      <FontAwesomeIcon
                        icon={faLinkedin}
                        style={{ fontSize: "30px" }}
                      />
                    </a>
                  </div>
                </div> */}
                
                {/* Logout Button */}
                <div className="d-flex align-items-center ms-3">
                  <button 
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-sm"
                    style={{
                      padding: '5px 15px',
                      borderRadius: '4px',
                      border: '1px solid #dc3545',
                      color: '#dc3545',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#dc3545';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#dc3545';
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </header>
      )}
    </>
  );
};

export default HeaderDraft;
