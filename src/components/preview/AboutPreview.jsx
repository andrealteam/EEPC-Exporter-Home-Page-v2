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

  // Show only first 300 words if not expanded
  const truncatedText = words.slice(0, 300).join(" ") + "...";

  if (isError) {
    return <div>Error loading about preview: {aboutError.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="row" style={{ marginBottom: "80px" }}>
        <div className="col-lg-6">
          <Skeleton height={500} />
        </div>
        <div className="col-lg-6">
          <Skeleton height={500} />
        </div>
      </div>
    );
  }

  return (
    <section style={{ position: "relative", padding: "60px 0" }}>
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="company-card">
              <div style={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                padding: '30px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <div className="main-title mb-4">
                  <h2 className="mb-0">About Our Company</h2>
                </div>
                <div style={{ width: "100%" }}>
                  <div
                    style={{ width: "100%" }}
                    className={expanded || !isLong ? "" : "truncated"}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(aboutData?.about_content || "<p>No company description available.</p>"),
                    }}
                  />

                  {isLong && (
                    <div style={{ marginTop: '20px' }}>
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="btn btn-link p-0"
                        style={{
                          color: '#007bff',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                      >
                        {expanded ? 'Read Less' : 'Read More'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
