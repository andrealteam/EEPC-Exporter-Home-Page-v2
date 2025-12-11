import React, { useState } from "react";
import { getBanner, getSocialMediaList } from "../../services/draftApi";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faTimes } from "@fortawesome/free-solid-svg-icons";
import { baseFileURL, getEcatalogue } from "../../services/api";
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

function BannerPreview({ memberId }) {
  const [playVideo, setPlayVideo] = useState(false);
  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState(false);

  const {
    data: bannerData,
    isLoading,
    isError,
    error: bannerError,
  } = useQuery({
    queryKey: ["banner-preview", memberId],
    queryFn: () => getBanner(memberId),
  });

  const { data: socialMediaList, isLoading: isLoadingSocialMedia } = useQuery({
    queryKey: ["social-media-list"],
    queryFn: () => getSocialMediaList(memberId),
  });
  const socialMediaListData =
    socialMediaList?.length > 0 ? socialMediaList : [];

  const { data: catalogueData, isLoading: isLoadingEcatalouge } = useQuery({
    queryKey: ["catalogue-live", memberId],
    queryFn: () => getEcatalogue(memberId),
  });

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
              <span>{bannerData?.member_id}</span>
            </p>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(bannerData.since_text),
              }}
            />
            {/* <p className="company-description">{bannerData.since_text}</p> */}
          </div>

          <div className="d-flex gap-3 align-items-center">
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
                  style={{ marginTop: "14px" }}
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

            {/* <button class="button mt-3" disabled>
              E-Catalogue
            </button> */}

            <button class="button mt-3" disabled>
              ★ Add to favorite
            </button>

            {/* <button className="btn favorite">Leave a Review</button> */}
            <button
              class="button mt-3"
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
  );
}

export default BannerPreview;
