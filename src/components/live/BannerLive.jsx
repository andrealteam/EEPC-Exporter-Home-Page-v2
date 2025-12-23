import React, { useEffect, useState } from "react";
import { getBanner, getSocialMediaList } from "../../services/draftApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { baseFileURL, getEcatalogue } from "../../services/api";
import {
  getFavorite,
  getLiveBanner,
  getLiveSocialMediaList,
  postAddToFavorite,
  postReview,
} from "../../services/liveApi";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faPinterest,
  faReddit,
  faSnapchat,
  faTelegram,
  faTiktok,
  faWhatsapp,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import DOMPurify from "dompurify";
import Skeleton from "react-loading-skeleton";
import { get, set } from "react-hook-form";
import toast from "react-hot-toast";
import CryptoJS from "crypto-js";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const secretKey = "my-secret-key";

const iconMap = {
  facebook: faFacebook,
  instagram: faInstagram,
  linkedin: faLinkedin,
  whatsapp: faWhatsapp,
  twitter: faXTwitter,
  youtube: faYoutube,
  tiktok: faTiktok,
  snapchat: faSnapchat,
  pinterest: faPinterest,
  reddit: faReddit,
  telegram: faTelegram,
};

// Colors for each platform (optional)
const colorMap = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  whatsapp: "#25D366",
  twitter: "#000000",
  youtube: "#FF0000",
  tiktok: "#000000",
  snapchat: "#FFFC00",
  pinterest: "#E60023",
  reddit: "#FF4500",
  telegram: "#0088cc",
};

function BannerLive({ website_url, isAdmin, member_id }) {
  const [playVideo, setPlayVideo] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [designation, setDesignation] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [isFavorite, setIsFavorite] = useState("removed");
  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState(false);

  const {
    data: bannerData,
    isLoading,
    isError,
    error: bannerError,
  } = useQuery({
    queryKey: ["banner-live", website_url],
    queryFn: () => getLiveBanner(website_url),
  });

  const { data: catalogueData, isLoading: isLoadingEcatalouge } = useQuery({
    queryKey: ["catalogue-live", member_id],
    queryFn: () => getEcatalogue(member_id),
  });

  const { data: socialMediaList, isLoading: isLoadingSocialMedia } = useQuery({
    queryKey: ["social-media-list-live", website_url],
    queryFn: () => getLiveSocialMediaList(website_url),
  });

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (name || email || phone) {
        const res = await getFavorite({
          website_url,
          email,
          name,
          phone,
        });
        if (res.status) {
          setIsFavorite(res.action);
        } else {
          setIsFavorite("removed");
        }
      }
    };
    checkFavoriteStatus();
  }, [website_url, email, name, phone]);

  const socialMediaListData =
    socialMediaList?.length > 0 ? socialMediaList : [];

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

  // console.log("banner data", bannerData);
  // console.log("social media list data", socialMediaListData);

  // function to extract YouTube video ID
  const getYouTubeId = (url) => {
    try {
      const regExp =
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    } catch {
      return null;
    }
  };

  const videoId = getYouTubeId(bannerData?.banner);
  const isYouTube = !!videoId;

  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      website_url,
      name: modalName || name,
      email: modalEmail || email,
      phone: modalPhone || phone,
      testimonial,
      designation,
    };
    let res = await postReview(formData, website_url);
    if (res.status) {
      if (!name || !email) {
        const data = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        };
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(data),
          secretKey
        ).toString();
        localStorage.setItem(website_url, encrypted);

        // localStorage.setItem(
        //   website_url,
        //   JSON.stringify({
        //     name: formData.name,
        //     email: formData.email,
        //     phone: formData.phone,
        //   })
        // );
        window.dispatchEvent(new Event("localStorageUpdated"));
      }
      toast.success(res?.message);
      setIsReviewModalOpen(false);
      setModalName("");
      setModalEmail("");
      setModalPhone("");
      setTestimonial("");
      setDesignation("");
    } else {
      setIsReviewModalOpen(false);
      setModalName("");
      setModalEmail("");
      setModalPhone("");
      setTestimonial("");
      setDesignation("");
      toast.error(res?.message || "Error submitting review");
    }
  };

  const maxChars = 400;

  const handleTestimonialChange = (e) => {
    let text = e.target.value;

    // ✅ Limit text to maximum characters
    if (text.length > maxChars) {
      text = text.slice(0, maxChars);
    }

    setTestimonial(text);
  };

  const addFavoriteWithoutModal = async (e) => {
    if (email || name) {
      // add to favorite logic here
      let res = await postAddToFavorite({ website_url, email, name, phone });
      if (res.status) {
        toast.success(res?.message || "Added to favorite");
        setIsFavorite(res.action);
      } else {
        toast.error(res?.message || "Error adding to favorite");
      }
    } else {
      setIsFavoriteModalOpen(true);
    }
  };
  const handleSubmitFavorite = async (e) => {
    e.preventDefault();
    if (modalEmail && modalName) {
      const formData = {
        website_url,
        name: modalName,
        email: modalEmail,
        phone: modalPhone,
      };
      let res = await postAddToFavorite(formData);
      if (res.status) {
        const data = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        };
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(data),
          secretKey
        ).toString();
        localStorage.setItem(website_url, encrypted);

        // localStorage.setItem(
        //   website_url,
        //   JSON.stringify({
        //     name: formData.name,
        //     email: formData.email,
        //     phone: formData.phone,
        //   })
        // );
        window.dispatchEvent(new Event("localStorageUpdated"));
        toast.success(res?.message || "Added to favorite");
        setIsFavoriteModalOpen(false);
        setModalName("");
        setModalEmail("");
        setModalPhone("");
        setIsFavorite(res.action);
      } else {
        toast.error(res?.message || "Error adding to favorite");
      }
    }
  };

  const closeModal = () => {
    setModalName("");
    setModalEmail("");
    setModalPhone("");
    setTestimonial("");
    setDesignation("");
    setIsReviewModalOpen(false);
    setIsFavoriteModalOpen(false);
  };

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    width: "100%",
  };

  if (isError) {
    return <div>Error loading banner: {bannerError.message}</div>;
  }

  if (isLoading || isLoadingSocialMedia)
    return (
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <Skeleton height={300} />
      </div>
    );
  return (
    <>
      <section class="position-relative" style={{ marginTop: "60px" }}>
        <div className="company-card">
          <div className="company-card-left">
            <div
              className="company-card-image"
              style={{
                position: "relative",
                height: "265px",
                width: "100%",
              }}
            >
              {/* Default image OR YouTube */}
              {!isYouTube ? (
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    height: "265px",
                    width: "100%",
                  }}
                >
                  <img
                    src={
                      bannerData?.banner
                        ? baseFileURL + bannerData?.banner
                        : baseFileURL + bannerData?.banner
                    }
                    alt="Preview"
                    width="200"
                    height="265"
                    style={{ height: "265px" }}
                  />
                  {/* <div
                    className="play-button"
                    onClick={() => setPlayVideo(true)}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: "30px",
                      cursor: "pointer",
                      color: "white",
                      background: "rgba(0,0,0,0.5)",
                      borderRadius: "50%",
                      padding: "5px 10px",
                    }}
                  >
                    ▶
                  </div> */}
                </div>
              ) : !playVideo ? (
                <iframe
                  width="400"
                  height="250"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube Video"
                ></iframe>
              ) : (
                <div
                  style={{
                    position: "relative",
                    width: "400px",
                    height: "250px",
                    cursor: "pointer",
                  }}
                  onClick={() => setPlayVideo(true)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt="YouTube Thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {/* Play Button */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: "40px",
                      color: "white",
                      background: "rgba(0,0,0,0.5)",
                      borderRadius: "50%",
                      padding: "10px 18px",
                    }}
                  >
                    ▶
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="d-flex flex-column justify-content-between"
            style={{ flex: "2" }}
          >
            <div className="d-flex flex-column gap-2 mt-4">
              <h2 className="company-name">{bannerData?.name}</h2>
              <p className="company-meta">
                IEC No: <span>{bannerData?.eic_no}</span> | Member Code:{" "}
                <span>M{bannerData?.member_id}</span>
              </p>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(bannerData.since_text),
                }}
              />
              {/* <p className="company-description">{bannerData.since_text}</p> */}
            </div>

            <div className=" d-flex gap-3 align-items-center">
              {socialMediaListData?.map((item) => {
                const icon = iconMap[item.social_media];
                if (!icon) return null; // agar iconMap me nahi hai to skip

                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-link"
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      style={{
                        fontSize: "30px",
                        color: colorMap[item.social_media] || "#000",
                      }}
                      className="footer-icon"
                    />
                  </a>
                );
              })}
            </div>
            <div className="action-buttons">
              {bannerData?.brochure && (
                <a
                  href={baseFileURL + bannerData?.brochure}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tj-primary-btn header_btn mt-3"
                  style={{ backgroundColor: "#f2f2f2" }}
                >
                  <div className="btn_inner">
                    <div className="btn_icon">
                      <FontAwesomeIcon icon={faArrowDown} />
                    </div>
                    <div className="btn_text">
                      <span>Download Brochure</span>
                    </div>
                  </div>
                </a>
              )}

              {/* <button className="btn secondary">E-Catalogue</button> */}
              {/* <button className="btn favorite">★ Add to favorite</button> */}
              {Array.isArray(catalogueData?.data) &&
                catalogueData.data.length > 0 && (
                  <button
                    className={`button ${
                      !Array.isArray(catalogueData?.data) ||
                      catalogueData?.data.length === 0
                        ? "disabled-btn"
                        : ""
                    }`}
                    onClick={() => {
                      if (
                        Array.isArray(catalogueData?.data) &&
                        catalogueData.data.length === 1
                      ) {
                        window.open(catalogueData.data[0].link, "_blank");
                      } else {
                        setIsCatalogueModalOpen(true);
                      }
                    }}
                    disabled={
                      !Array.isArray(catalogueData?.data) ||
                      catalogueData.data.length === 0
                    }
                  >
                    E-Catalogue
                  </button>
                )}

              <button className="button" onClick={addFavoriteWithoutModal}>
                {isFavorite === "added" ? (
                  <span>❤️ Added to Favorite</span>
                ) : (
                  <span>🤍 Add to Favorite</span>
                )}
              </button>

              {/* <button className="btn favorite">Leave a Review</button> */}
              <button
                class="button"
                onClick={() => setIsReviewModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <div class="svg-wrapper-1">
                  <div class="svg-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path
                        fill="currentColor"
                        d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <span>Leave a Review</span>
              </button>
            </div>
          </div>
        </div>
        {isFavoriteModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "10px",
                // width: "300px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                position: "relative",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  position: "absolute",
                  top: "0",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  fontSize: "30px",
                  cursor: "pointer",
                  paddingLeft: "30px",
                  color: "#666",
                }}
              >
                &times;
              </button>

              {/* <h3 style={{ marginBottom: "20px", fontSize: "22px" }}>
                Please provide your details to add to favorite
              </h3> */}

              <form onSubmit={handleSubmitFavorite}>
                <input
                  type="text"
                  placeholder="Name"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  required
                  style={inputStyle}
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  required
                  style={inputStyle}
                />

                <input
                  type="tel"
                  placeholder="Phone (Optional)"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="submit"
                  style={{
                    marginTop: "10px",
                    padding: "10px 15px",
                    backgroundColor:
                      !modalEmail || !modalName ? "#ccc" : "#0195a3", // disable color
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor:
                      !modalEmail || !modalName ? "not-allowed" : "pointer", // disable cursor
                    width: "100%",
                    opacity: !modalEmail || !modalName ? 0.7 : 1, // thoda fade effect
                  }}
                  disabled={!modalEmail || !modalName}
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
        {isReviewModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "10px",
                // width: "300px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                position: "relative",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  position: "absolute",
                  top: "0",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  fontSize: "30px",
                  cursor: "pointer",
                  paddingLeft: "30px",
                  color: "#666",
                }}
              >
                &times;
              </button>

              <h3 style={{ marginBottom: "20px", fontSize: "22px" }}>
                It would mean a lot to us if you share your valuable feedback
                regarding your experience!
              </h3>

              {isAdmin && (
                <h6 style={{ color: "red" }}>
                  You can’t submit a review for your own website.
                </h6>
              )}

              <form onSubmit={handleSubmit}>
                <div style={rowStyle}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={modalName || name}
                    onChange={(e) => setModalName(e.target.value)}
                    required
                    style={inputStyle}
                    disabled={!!name}
                  />

                  <input
                    type="text"
                    placeholder="Designation (Optional)"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    style={{ width: "100%", ...inputStyle }}
                  />
                </div>

                <div style={rowStyle}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={modalEmail || email}
                    disabled={!!email}
                    onChange={(e) => setModalEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />

                  <input
                    type="tel"
                    placeholder="Phone (Optional)"
                    value={modalPhone || phone}
                    disabled={!!phone}
                    onChange={(e) => setModalPhone(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <textarea
                  placeholder="Your Review"
                  value={testimonial}
                  onChange={(e) => {
                    const value = e.target.value;
                    // const words = value.trim().split(/\s+/).filter(Boolean);
                    const chars = value.length;

                    // ✅ Restrict both words and characters
                    if (chars <= maxChars) {
                      handleTestimonialChange(e);
                    }
                  }}
                  required
                  style={{ ...inputStyle, height: "100px", width: "100%" }}
                ></textarea>

                <p style={{ fontSize: "14px", color: "#666" }}>
                  {/* {testimonial.trim().split(/\s+/).filter(Boolean).length} /{" "}
                  {maxWords} words | */}
                  {testimonial.length} / {maxChars} characters
                </p>

                <button
                  type="submit"
                  style={{
                    marginTop: "10px",
                    padding: "10px 15px",
                    backgroundColor:
                      !(
                        (modalName || name) &&
                        (modalEmail || email) &&
                        testimonial
                      ) || isAdmin
                        ? "#ccc"
                        : "#0195a3", // disable color
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor:
                      !(
                        (modalName || name) &&
                        (modalEmail || email) &&
                        testimonial
                      ) || isAdmin
                        ? "not-allowed"
                        : "pointer", // disable cursor
                    width: "100%",
                    opacity:
                      !(
                        (modalName || name) &&
                        (modalEmail || email) &&
                        testimonial
                      ) || isAdmin
                        ? 0.7
                        : 1, // thoda fade effect
                  }}
                  disabled={
                    !(
                      (modalName || name) &&
                      (modalEmail || email) &&
                      testimonial
                    ) || isAdmin
                  }
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
        {isCatalogueModalOpen && Array.isArray(catalogueData?.data) && (
          <div className="catalogue-modal">
            <div className="catalogue-content">
              <button
                className="close-modal-btn"
                onClick={() => setIsCatalogueModalOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              {catalogueData?.data?.map((item, index) => (
                <div key={index} className="catalogue-row">
                  <span className="catalogue-title">{item.Catalogue_Type}</span>

                  <button
                    className="visit-btn"
                    onClick={() => window.open(item.link, "_blank")}
                  >
                    Visit Catalogue
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

export default BannerLive;