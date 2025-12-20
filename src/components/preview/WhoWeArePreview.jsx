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
    if (!url) return null;
    const regex =
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoID = getYouTubeID(whoWeData?.video_link);
  const thumbnailURL = videoID ? `https://img.youtube.com/vi/${videoID}/hqdefault.jpg` : '';
  const videoURL = videoID ? `https://www.youtube.com/watch?v=${videoID}` : '';

  // Determine the column classes based on whether there's a video
  const leftColumnClass = videoID ? "col-lg-6" : "col-12";
  const rightColumnClass = videoID ? "col-lg-6" : "d-none";

  if (isLoading) {
    return (
      <section className="pb-10" style={{ position: "relative", padding: "40px 0" }}>
        <div className="container">
          <div className="text-center">Loading company information...</div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="pb-10" style={{ position: "relative", padding: "40px 0" }}>
        <div className="container">
          <div className="alert alert-danger">Error loading company information.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-10" style={{ position: "relative", padding: "60px 0" }}>
      <div className="container">
        <div className="row align-items-center">
          <div className={leftColumnClass}>
            <div className="table-card" style={{ 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              padding: '30px'
            }}>
              <div className="main-title mb-4">
                <h2 className="mb-0">Who We Are</h2>
              </div>
              <div className="table-responsive">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '40%', color: '#555' }}>
                        Exporter and Manufacturer
                      </th>
                      <td>{whoWeData?.nature_of_business || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row" style={{ color: '#555' }}>
                        Additional Business
                      </th>
                      <td>{whoWeData?.additional_business || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row" style={{ color: '#555' }}>
                        Company CEO
                      </th>
                      <td>{whoWeData?.company_ceo || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row" style={{ color: '#555' }}>
                        Registered Address
                      </th>
                      <td>{whoWeData?.registered_address || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row" style={{ color: '#555' }}>
                        Total Employees
                      </th>
                      <td>{whoWeData?.total_employees || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row" style={{ color: '#555' }}>
                        Year of Establishment
                      </th>
                      <td>{whoWeData?.year_of_est || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row" style={{ color: '#555' }}>
                        Legal Status
                      </th>
                      <td>{whoWeData?.firm_status || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th scope="row" style={{ color: '#555' }}>
                        Annual Turnover
                      </th>
                      <td>{whoWeData?.annual_turnover || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {videoID && (
            <div className={rightColumnClass}>
              <div className="position-relative" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <a
                  href={videoURL}
                  className="d-block position-relative"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={thumbnailURL}
                    alt="Video Thumbnail"
                    className="img-fluid w-100"
                    style={{ display: 'block' }}
                  />
                  <div className="position-absolute" style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '24px',
                    transition: 'all 0.3s ease',
                    border: '2px solid #fff'
                  }}>
                    <FontAwesomeIcon icon={faPlay} style={{ marginLeft: '5px' }} />
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WhoWeArePreview;
