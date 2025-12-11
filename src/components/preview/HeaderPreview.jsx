import React, { useState } from "react";
import { getHeader } from "../../services/draftApi";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelopeOpen,
  faPhoneVolume,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { baseFileURL } from "../../services/api";
import Favicon from "../../utils/Favicon";

const HeaderPreview = ({ memberId }) => {
  const {
    data: headerData = {},
    isLoading,
    isError,
    error: headerError,
  } = useQuery({
    queryKey: ["header-preview", memberId],
    queryFn: () => getHeader(memberId),
    enabled: !!memberId, // avoid hitting API with undefined id
    placeholderData: {},
  });
  if (isLoading) {
    return <Skeleton height={80} />;
  }
  return (
    <header className="header" style={{ position: "relative" }}>
      <Favicon iconUrl={baseFileURL + headerData?.logo} />

      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          {/* Logo */}
          <a className="navbar-brand" href="#">
            {isLoading ? (
              <Skeleton width={120} />
            ) : (
              headerData?.logo && (
                <img
                  src={baseFileURL + headerData?.logo}
                  alt="Logo"
                  width="120"
                />
              )
            )}
          </a>

          {/* Right-side contact info */}
          <div className="d-flex ms-auto">
            {headerData?.whatsapp && (
              <div className="contact-box">
                <FontAwesomeIcon icon={faWhatsapp} />
                <div className="call-text">
                  <span>WhatsApp Us:</span>
                  <a href={`https://wa.me/${headerData.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                    {headerData.whatsapp}
                  </a>
                </div>
              </div>
            )}
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
                <a href={`mailto:${headerData?.email}`}>{headerData?.email}</a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default HeaderPreview;
