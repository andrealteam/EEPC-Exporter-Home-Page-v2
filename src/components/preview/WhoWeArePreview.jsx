import React from "react";
import { getWhoWeAre } from "../../services/draftApi";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

const WhoWeArePreview = ({ memberId }) => {
  const {
    data: whoWeData,
    isLoading,
    isError,
    error: whoWeError,
  } = useQuery({
    queryKey: ["whoWe-preview", memberId],
    queryFn: () => getWhoWeAre(memberId),
  });

  // Extract YouTube Video ID
  const getYouTubeID = (url) => {
    const regex =
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/;
    const match = url?.match(regex);
    return match ? match[1] : null;
  };

  const videoID = getYouTubeID(whoWeData?.video_link);
  const thumbnailURL = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
  const videoURL = `https://www.youtube.com/watch?v=${videoID}`;

  // Determine the column classes based on whether there's a video
  const leftColumnClass = videoID ? "col-lg-6" : "col-12";
  const rightColumnClass = videoID ? "col-lg-6" : "d-none";

  return (
    <section class="pb-10" style={{ position: "relative", paddingBottom: "12px", marginBottom: "0" }}>
      <div class="container">
        <div class="row">
          <div class={leftColumnClass}>
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
                    <tr>
                      <th scope="row" class="">
                        Exporter and Manufacturer
                      </th>
                      <td>{whoWeData?.nature_of_business}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="">
                        Additional Business
                      </th>
                      <td>{whoWeData?.additional_business}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="">
                        Company CEO
                      </th>
                      <td>{whoWeData?.company_ceo}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="">
                        Registered Address
                      </th>
                      <td>{whoWeData?.registered_address}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="">
                        Total Number of Employees
                      </th>
                      <td>{whoWeData?.total_employees}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="">
                        Year of Establishment
                      </th>
                      <td>{whoWeData?.year_of_est}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="">
                        Legal Status of Firm
                      </th>
                      <td>{whoWeData?.firm_status}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="">
                        Annual Turnover
                      </th>
                      <td>{whoWeData?.annual_turnover}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {videoID && (
            <div class={rightColumnClass}>
              <div class="video-wrapper">
                <div class="corporate-video-wrapper position-relative">
                  <div class="corporate-video position-relative">
                    <div>
                      <a
                        href={videoURL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src={thumbnailURL} alt="YouTube Video Thumbnail" className="img-fluid" />
                        <FontAwesomeIcon
                          icon={faPlay}
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            fontSize: "48px",
                            color: "white",
                            borderRadius: "50%",
                            padding: "10px",
                          }}
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </section>
  );
};

export default WhoWeArePreview;
