import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FinalReview = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Push a dummy state so that back button always lands here
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="center-screen">
      <div className="popup-container">
        <h3 className="">Registration Submitted Successfully!</h3>
        <p>
          Thank you for submitting your registration form. It is currently under review. Once approved, you will be able to create your profile.
        </p>

        <p>
          In the meantime, you can learn more about us by visiting the <br />
          <a
            href="https://eepc-exporter-home-page-v2-whhx.vercel.app/dashboard/exporter-home-page"
            target="_blank"
            rel="noopener noreferrer"
          >
            Exporter Home Page
          </a>{" "}
          in your Member Dashboard.
        </p>
      </div>
    </div>
  );
};

export default FinalReview;
