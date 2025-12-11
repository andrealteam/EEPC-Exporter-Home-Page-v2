import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getAddress } from "../../services/draftApi";
import Skeleton from "react-loading-skeleton";

const MapReview = ({ memberId }) => {
  const {
    data: addressData = {},
    isLoading,
    isError,
    error: addressError,
  } = useQuery({
    queryKey: ["map-review-draft", memberId],
    queryFn: () => getAddress(memberId),
    enabled: !!memberId,
  });

  // Encode the address for URL safety
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    addressData?.address
  )}&output=embed`;

  if (isLoading) {
    return (
      <div className="contact-section">
        <div className="contact-form">
          <Skeleton height={50} count={5} />
        </div>
        <div className="contact-map">
          <Skeleton height={300} />
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Error: {addressError.message}</div>;
  }

  return (
    <div className="contact-section">
      <div className="contact-form">
        <p className="small-text">Write To Us</p>
        <h2 className="title">Get In Touch</h2>

        <form>
          <input
            type="text"
            className="form-input"
            placeholder="Your full name"
          />
          <input
            type="email"
            className="form-input"
            placeholder="Your E-Mail Address"
          />
          <textarea
            className="form-textarea"
            placeholder="Type your message here"
          ></textarea>

          <button class="button" disabled>
            Send Enquiry
          </button>
        </form>
      </div>

      {/* <div className="contact-map">
        <h3 className="map-title">
          <span className="map-icon">📍</span> Locate us on map
        </h3>
        <div className="map-container">
          <iframe
            src={mapSrc}
            allowFullScreen=""
            loading="lazy"
            title="Google Map"
          ></iframe>
        </div>
      </div> */}
    </div>
  );
};

export default MapReview;
