import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { demoLogo } from "../../utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import {
  getBanner,
  getFooter,
  getHeader,
  getSocialMediaList,
  postFooter,
} from "../../services/draftApi";

import { baseFileURL } from "../../services/api";
import { faArrowDown, faPen } from "@fortawesome/free-solid-svg-icons";
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
import toast from "react-hot-toast";

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
  facebook: "#fff",
  instagram: "#fff",
  linkedin: "#fff",
  whatsapp: "#fff",
  twitter: "#fff",
  youtube: "#fff",
  tiktok: "#fff",
  snapchat: "#fff",
  pinterest: "#fff",
  reddit: "#FF4500",
  telegram: "#0088cc",
};

const FooterDraft = ({ memberId }) => {
  const { markAsChanged } = useChangeTracker();
  const [openViewEdit, setOpenViewEdit] = useState(false);
  const {
    data: footerData = {},
    isLoading,
    isError,
    error: footerError,
  } = useQuery({
    queryKey: ["footer-draft", memberId],
    queryFn: () => getFooter(memberId),
    enabled: !!memberId,
    placeholderData: {},
  });

  const { data: socialMediaList = [] } = useQuery({
    queryKey: ["social-media-list", memberId],
    queryFn: () => getSocialMediaList(memberId),
    enabled: !!memberId,
    placeholderData: [],
    select: (data) => {
      // Ensure we always return an array, even if the API returns undefined or null
      if (Array.isArray(data?.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      }
      return [];
    }
  });

  const [editedBanner, setEditedBanner] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });


  useEffect(() => {
    if (footerData) {
      setEditedBanner({
        facebook: footerData.facebook,
        twitter: footerData.twitter,
        instagram: footerData.instagram,
        linkedin: footerData.linkedin,
      });
    }
  }, [footerData]);

  const handleCancel = () => {
    setOpenViewEdit(false);
  };
  const queryClient = useQueryClient();
  const handleSave = async () => {
    let res = await postFooter(
      memberId,
      editedBanner.facebook,
      editedBanner.twitter,
      editedBanner.instagram,
      editedBanner.linkedin
    );
    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["footer-draft", memberId]);
      setOpenViewEdit(false);
    } else {
      toast.error(res?.message);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBanner((prev) => ({ ...prev, [name]: value }));
    markAsChanged();
  };


  if (isError)
    return <p>Error: {footerError.message || "Something went wrong!"}</p>;

  return (
    <>
      {openViewEdit ? (
        <footer class="footer" style={{ position: "relative" }}>
          <div className="update-btn" style={{ zIndex: 9999 }}>
            <button className="edit-btn-2 btn-primary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="edit-btn-1 btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
          <div class="container d-flex justify-content-between align-items-center">
            <span>&copy; 2025 {footerData?.name}</span>

            <div style={{ display: "flex", marginRight: "95px", gap: "9px" }}>
              <input
                type="text"
                name="facebook"
                value={editedBanner?.facebook}
                onChange={handleInputChange}
                className="form-control"
                placeholder="paste your facebook link"
              />
              <input
                type="text"
                name="twitter"
                value={editedBanner?.twitter}
                onChange={handleInputChange}
                className="form-control"
                placeholder="paste your twitter link"
              />
              <input
                type="text"
                name="instagram"
                value={editedBanner?.instagram}
                onChange={handleInputChange}
                className="form-control"
                placeholder="paste your instagram link"
              />
              <input
                type="text"
                name="linkedin"
                value={editedBanner?.linkedin}
                onChange={handleInputChange}
                className="form-control"
                placeholder="paste your linkedin link"
              />
            </div>
          </div>
        </footer>
      ) : (
        <footer class="footer">
          {/* <button
            className="update-btn"
            style={{ background: "red", zIndex: 9999 }}
            onClick={() => {
              // console.log("clicked");
              setOpenViewEdit(true);
            }}
          >
            <FontAwesomeIcon icon={faPen} />
          </button> */}

          <div className="footer-container">
            <span className="footer-copy">&copy; 2025 {footerData?.name}</span>

            <div className="footer-social">
              {Array.isArray(socialMediaList) && socialMediaList.map((item) => {
                if (!item || !item.social_media) return null;
                const icon = iconMap[item.social_media] || null;
                if (!icon) return null;

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
                      className="footer-icon"
                      style={{ color: colorMap[item.social_media] || "#000" }}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </footer>
      )}
    </>
  );
};

export default FooterDraft;
