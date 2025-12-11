import React from "react";
import { getFooter } from "../../services/draftApi";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getLiveFooter, getLiveSocialMediaList } from "../../services/liveApi";

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

const FooterPreview = ({ website_url }) => {
  const {
    data: footerData,
    isLoading,
    isError,
    error: footerError,
  } = useQuery({
    queryKey: ["footer-preview", website_url],
    queryFn: () => getLiveFooter(website_url),
  });

  const {
    data: socialMediaList,
    isLoading: isLoadingSocialMedia,
    isError: isErrorSocialMedia,
    error: socialMediaError,
  } = useQuery({
    queryKey: ["social-media-list-live", website_url], // ✅ same key as above
    queryFn: () => getLiveSocialMediaList(website_url),
  });

  

  if (isLoading) {
    return <div>Loading footer...</div>;
  }

  if (isLoadingSocialMedia) {
    return <div>Loading social media...</div>;
  }

  return (
    <footer class="footer">
      <div className="footer-container">
        <span className="footer-copy">&copy; 2025 {footerData[0]?.name}</span>

        <div className="footer-socials" style={{marginRight: "350px"}}>
          { socialMediaList?.map((item) => {
            const icon = iconMap[item.social_media];
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
  );
};

export default FooterPreview;
