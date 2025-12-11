import React from "react";

const RejectSectionBanner = ({ rejectionNumbers, rejectMsg }) => {
  const rejectionPoints = [
    "Header section",
    "Banner section",
    "",
    "About and WhoWeAre section",
    "Products section",
  ];

  const sectionIds = [
    "header",
    "banner-section",
    "",
    "about-section",
    "product-section",
  ];

  // 🔹 Scroll to section smoothly
  const handleEdit = (id) => {
    const section = document.querySelector(`.${id}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <div className="rejection-banner">
      <h3 className="banner-title">⚠️ Rejection Notice</h3>
      <p className="banner-message">{rejectMsg}</p>
      {rejectionNumbers.length > 0 && (
        <h1 className="banner-message">
          Please fix the following sections before you can publish.
        </h1>
      )}

      <ul className="rejection-list">
        {rejectionPoints
          .filter((_, index) => rejectionNumbers?.includes(index + 1))
          .map((point, filteredIndex) => {
            const sectionClass =
              sectionIds[rejectionNumbers[filteredIndex] - 1];
            return (
              <li key={filteredIndex} className="rejection-item">
                <span className="rejection-text">
                  {filteredIndex + 1}. {point}
                </span>
                <button
                  className="edit-btn-rjc"
                  onClick={() => handleEdit(sectionClass)}
                >
                  Edit
                </button>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default RejectSectionBanner;
