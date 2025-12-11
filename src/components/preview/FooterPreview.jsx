import React from "react";
import { getFooter, getSocialMediaList } from "../../services/draftApi";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  reddit: "#fff",
  telegram: "#fff",
};

const FooterPreview = ({ memberId }) => {
  const {
    data: footerData,
    isLoading,
    isError,
    error: footerError,
  } = useQuery({
    queryKey: ["footer-preview", memberId],
    queryFn: () => getFooter(memberId),
  });
  const { data: socialMediaList } = useQuery({
    queryKey: ["social-media-list", memberId], // ✅ same key as above
    queryFn: () => getSocialMediaList(memberId),
  });
  return (
    <footer class="footer">
      <div className="footer-container">
        <span className="footer-copy">&copy; 2025 {footerData?.name}</span>

        <div className="footer-socials">
          {Array.isArray(socialMediaList) && socialMediaList.map((item) => {
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
