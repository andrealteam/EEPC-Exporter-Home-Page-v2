import React, { useState } from "react";
import { getAbout, getWhoWeAre } from "../../services/draftApi";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { baseFileURL } from "../../services/api";
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
// 1️⃣ Convert HTML to plain text ONLY for word count
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
      <div class="row" style={{ marginBottom: "80px" }}>
        <div class="col-lg-6">
          <Skeleton height={500} />
        </div>
        <div class="col-lg-6">
          <Skeleton height={500} />
        </div>
      </div>
    );
  }
  return (
    <section style={{ position: "relative", paddingTop: "60px" }}>
      <div class="row">
        <div class="col-12">
          <div class="company-card">
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
                    __html: DOMPurify.sanitize(aboutData?.about_content),
                  }}
                />

                {isLong && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                      color: "blue",
                      cursor: "pointer",
                      marginTop: "10px",
                    }}
                  >
                    {expanded ? (
                      <button class="learn-more read-more">
                        <span class="circle" aria-hidden="true">
                          <span class="icon arrow"></span>
                        </span>
                        <span class="button-text">Read Less</span>
                      </button>
                    ) : (
                      <button class="learn-more read-more">
                        <span class="circle" aria-hidden="true">
                          <span class="icon arrow"></span>
                        </span>
                        <span class="button-text">Read More</span>
                      </button>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div class="col-12" style={{ marginTop: "30px" }}>
          <div class="company-card">
            <div class="table-card">
              <div class="main-title">
                <div>
                  <span>Basic Information</span>
                  <h2>
                    Who we are
                    <button class="edit-btn">
                      <i class="fa-solid fa-pencil"></i>
                    </button>
                  </h2>
                </div>
              </div>
              <div class="table-responsive basic-info-table">
                <table class="table">
                  <tbody>
                    {aboutData?.nature_of_business && (
                      <tr>
                        <th scope="row" class="">
                          Exporter and Manufacturer
                        </th>
                        <td>{aboutData?.nature_of_business}</td>
                      </tr>
                    )}

                    {aboutData?.additional_business && (
                      <tr>
                        <th scope="row" class="">
                          Additional Business
                        </th>
                        <td>{aboutData?.additional_business}</td>
                      </tr>
                    )}
                    {aboutData?.company_ceo && (
                      <tr>
                        <th scope="row" class="">
                          Company CEO
                        </th>
                        <td>{aboutData?.company_ceo}</td>
                      </tr>
                    )}
                    {aboutData?.registered_address && (
                      <tr>
                        <th scope="row" class="">
                          Registered Address
                        </th>
                        <td>{aboutData?.registered_address}</td>
                      </tr>
                    )}

                    {aboutData?.total_employees && (
                      <tr>
                        <th scope="row" class="">
                          Total Number of Employees
                        </th>
                        <td>{aboutData?.total_employees}</td>
                      </tr>
                    )}
                    {aboutData?.year_of_est && (
                      <tr>
                        <th scope="row" class="">
                          Year of Establishment
                        </th>
                        <td>{aboutData?.year_of_est}</td>
                      </tr>
                    )}
                    {aboutData?.firm_status && (
                      <tr>
                        <th scope="row" class="">
                          Legal Status of Firm
                        </th>
                        <td>{aboutData?.firm_status}</td>
                      </tr>
                    )}
                    {aboutData?.annual_turnover && (
                      <tr>
                        <th scope="row" class="">
                          Annual Turnover
                        </th>
                        <td>{aboutData?.annual_turnover}</td>
                      </tr>
                    )}
                    {aboutData?.export_destination !== "[]" && (
                      <tr>
                        <th scope="row" class="">
                          Export Destinations
                        </th>
                        <td>{aboutData?.export_destination &&
                          (() => {
                            let data = aboutData.export_destination;
                            let countries = "";

                            // 🧠 Step 1: Deeply unwrap up to 15 times (handles all levels)
                            for (let i = 0; i < 15; i++) {
                              if (typeof data !== "string") break;
                              const trimmed = data.trim();

                              try {
                                const parsed = JSON.parse(trimmed);
                                data = parsed;
                              } catch {
                                // try one last unescape pass before giving up
                                const unescaped = trimmed
                                  .replace(/\\\\/g, "\\")
                                  .replace(/\\"/g, '"');
                                if (unescaped !== trimmed) {
                                  data = unescaped;
                                  continue;
                                }
                                break;
                              }
                            }

                            // 🧹 Step 2: Normalize data
                            if (Array.isArray(data)) {
                              countries = data.join(", ");
                            } else if (typeof data === "string") {
                              countries = data
                                .replace(/\\/g, "") // remove extra backslashes
                                .replace(/^"+|"+$/g, "") // remove wrapping quotes
                                .split(",")
                                .map((c) => c.trim())
                                .filter(Boolean)
                                .join(", ");
                            }

                            // 🧾 Step 3: Safe fallback if still nothing parsed
                            if (
                              !countries &&
                              typeof aboutData.export_destination === "string"
                            ) {
                              countries = aboutData.export_destination
                                .replace(/\\/g, "")
                                .replace(/^"+|"+$/g, "")
                                .split(",")
                                .map((c) => c.trim())
                                .filter(Boolean)
                                .join(", ");
                            }

                            const isEmpty =
                              !countries ||
                              countries.trim() === "" ||
                              countries.trim() === "[]" ||
                              countries.replace(/[\[\]]/g, "").trim() === "";

                            return !isEmpty ? (
                              <p>{countries}</p>
                            ) : (
                              null
                            );
                          })()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
