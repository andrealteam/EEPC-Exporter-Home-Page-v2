import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
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
import toast from "react-hot-toast";

import { baseFileURL, getEcatalogue } from "../../services/api";
import {
  getLiveBanner,
  getLiveSocialMediaList,
  postAddToFavorite,
  postReview,
} from "../../services/liveApi";

/* ---------------- ICON MAPS ---------------- */

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

const colorMap = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  whatsapp: "#25D366",
  twitter: "#000000",
  youtube: "#FF0000",
};

/* ---------------- COMPONENT ---------------- */

function BannerLive({ website_url, isAdmin, member_id, isLoggedIn }) {
  const [testimonial, setTestimonial] = useState("");
  const [designation, setDesignation] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState(false);

  const maxChars = 400;

  /* ---------------- DATA ---------------- */

  const { data: bannerData, isLoading } = useQuery({
    queryKey: ["banner-live", website_url],
    queryFn: () => getLiveBanner(website_url),
  });

  const { data: socialMediaList } = useQuery({
    queryKey: ["social-media-list-live", website_url],
    queryFn: () => getLiveSocialMediaList(website_url),
  });

  const { data: catalogueData } = useQuery({
    queryKey: ["catalogue-live", member_id],
    queryFn: () => getEcatalogue(member_id),
    enabled: !!member_id,
  });

  /* ---------------- REVIEW GUARDS ---------------- */

  const isOwnerOrAdmin = isAdmin || !!member_id;

  const canOpenReviewModal = () => {
    if (!isLoggedIn) {
      toast.error("Please login to submit a review");
      return;
    }

    if (isOwnerOrAdmin) {
      toast.error("You cannot review your own website");
      return;
    }

    setIsReviewModalOpen(true);
  };

  /* ---------------- SUBMIT REVIEW ---------------- */

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isLoggedIn || isOwnerOrAdmin) {
      toast.error("Action not allowed");
      return;
    }

    const res = await postReview({
      website_url,
      testimonial,
      designation,
    });

    if (res?.status) {
      toast.success(res.message || "Review submitted");
      setTestimonial("");
      setDesignation("");
      setIsReviewModalOpen(false);
    } else {
      toast.error(res?.message || "Failed to submit review");
    }
  };

  /* ---------------- RENDER ---------------- */

  if (isLoading) {
    return <Skeleton height={300} />;
  }

  return (
    <>
      <section className="position-relative" style={{ marginTop: "60px" }}>
        <div className="company-card">
          <div className="company-card-left">
            <img
              src={baseFileURL + bannerData?.banner}
              alt="Banner"
              height="265"
            />
          </div>

          <div className="company-card-right">
            <h2>{bannerData?.name}</h2>

            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(bannerData?.since_text),
              }}
            />

            <div className="social-icons">
              {socialMediaList?.map((item) => {
                const icon = iconMap[item.social_media];
                if (!icon) return null;

                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      color={colorMap[item.social_media]}
                      size="2x"
                    />
                  </a>
                );
              })}
            </div>

            <div className="action-buttons">
              {bannerData?.brochure && (
                <a
                  href={baseFileURL + bannerData.brochure}
                  download
                  className="button"
                >
                  <FontAwesomeIcon icon={faArrowDown} /> Download Brochure
                </a>
              )}

              <button className="button" onClick={canOpenReviewModal}>
                Leave a Review
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- REVIEW MODAL ---------------- */}

        {isReviewModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-box">
              <button
                className="close-btn"
                onClick={() => setIsReviewModalOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              <h3>Share your experience</h3>

              <form onSubmit={handleSubmitReview}>
                <input
                  type="text"
                  placeholder="Designation (Optional)"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />

                <textarea
                  placeholder="Your Review"
                  value={testimonial}
                  onChange={(e) =>
                    setTestimonial(e.target.value.slice(0, maxChars))
                  }
                  required
                />

                <p>{testimonial.length} / {maxChars}</p>

                <button type="submit" className="submit-btn">
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default BannerLive;
