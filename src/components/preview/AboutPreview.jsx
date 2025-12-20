import React, { useState } from "react";
import { getWhoWeAre } from "../../services/draftApi";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import Skeleton from "react-loading-skeleton";

const AboutPreview = ({ memberId }) => {
  const [expanded, setExpanded] = useState(false);

  const {
    data: aboutData,
    isLoading,
    isError,
    error: aboutError,
  } = useQuery({
    queryKey: ["about-draft"],
    queryFn: () => getWhoWeAre(memberId),
  });

  // Convert HTML to plain text to count words
  const plainText = aboutData?.about_content
    ? DOMPurify.sanitize(aboutData.about_content, { ALLOWED_TAGS: [] })
    : "";

  const words = plainText.split(/\s+/);
  const isLong = words.length > 100;

  if (isError) {
    return <div>Error loading about preview: {aboutError.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="row" style={{ marginBottom: "80px" }}>
        <div className="col-12">
          <Skeleton height={200} />
        </div>
      </div>
    );
  }

  if (!aboutData?.about_content) {
    return null; // Don't render anything if there's no content
  }

  return (
    <section style={{ position: "relative", paddingTop: "60px" }}>
      <div className="row">
        <div className="col-12">
          <div className="company-card">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="main-title">
                <div>
                  <span>About our company</span>
                </div>
              </div>
              <div style={{ width: "100%" }}>
                <div
                  style={{ width: "100%" }}
                  className={expanded || !isLong ? "" : "truncated"}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(aboutData.about_content),
                  }}
                />

                {isLong && (
                  <div style={{ marginTop: "15px" }}>
                    <button 
                      className="learn-more read-more"
                      onClick={() => setExpanded(!expanded)}
                    >
                      <span className="circle" aria-hidden="true">
                        <span className="icon arrow"></span>
                      </span>
                      <span className="button-text">
                        {expanded ? "Read Less" : "Read More"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
