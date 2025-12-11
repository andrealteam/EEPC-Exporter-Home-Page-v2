import React, { useEffect, useState } from "react";
import { getProducts } from "../../services/draftApi";
import { useQuery } from "@tanstack/react-query";
import { baseFileURL } from "../../services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { getLiveProducts } from "../../services/liveApi";
import Skeleton from "react-loading-skeleton";
import Accordion from "react-bootstrap/Accordion";
import "bootstrap/dist/css/bootstrap.min.css";
import Slider from "react-slick";

const ProductsPreview = ({ website_url }) => {
  const [viewModal, setViewModal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMore, setViewMore] = useState(false);

  const WORD_LIMIT = 40;
  const CHAR_LIMIT = 200;

  const [activeCategory, setActiveCategory] = useState(null);
  const {
    data: displayProducts,
    isLoading,
    isError,
    error: productsError,
  } = useQuery({
    queryKey: ["product-live-data", website_url],
    queryFn: () => getLiveProducts(website_url),
    enabled: !!website_url,
  });


  const categoryTabs = Object?.keys(displayProducts || {});

  useEffect(() => {
    const firstCategory = categoryTabs[0];
    setActiveCategory(firstCategory);
    setSelectedCategory(firstCategory);
  }, [displayProducts]);

  const productCount =
    (selectedCategory && displayProducts[selectedCategory]?.length) || 0;

  const sliderSettings = {
    dots: productCount > 1,
    infinite: productCount > 1,
    speed: 2000,
    autoplay: productCount > 1,
    autoplaySpeed: 3000,
    slidesToShow: productCount > 1 ? Math.min(productCount, 4) : 1,
    slidesToScroll: 1,
    arrows: productCount > 1,
    centerMode: false, // ✅ prevent stretch
    centerPadding: "0px", // ✅ no side padding
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: productCount > 2 ? 2 : productCount,
        },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const isLessThanFour = categoryTabs.length < 4;

  const sliderSettingsTabs = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: isLessThanFour ? categoryTabs.length : 4,
    slidesToScroll: 1,
    arrows: !isLessThanFour, // hide arrows when not needed
    swipe: !isLessThanFour, // no swipe when less than 4
    draggable: !isLessThanFour,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: isLessThanFour ? categoryTabs.length : 2,
          swipe: !isLessThanFour,
          draggable: !isLessThanFour,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: isLessThanFour ? categoryTabs.length : 1,
          swipe: !isLessThanFour,
          draggable: !isLessThanFour,
        },
      },
    ],
  };

  if (!displayProducts || Object.keys(displayProducts).length === 0) {
    return <div></div>;
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className=" mb-5 text-center">
          <Skeleton height={50} width={150} />
        </div>
        <div className="mb-4 category-slider">
          <Skeleton height={50} />
        </div>
        <div className="p-2 product-item">
          <Skeleton height={200} />
        </div>
      </div>
    );
  }
  return (
    <>
      <section
        // className="pb-100"
        style={{ position: "relative", paddingTop: "60px" }}
      >
        <div className="container">
          <div className="main-title mb-5 text-center">
            <div>
              <span>Our Products</span>
              <h2>
                What We Offer
                <button className="edit-btn">
                  <i className="fa-solid fa-pencil"></i>
                </button>
              </h2>
            </div>
          </div>

          {/* Category Tabs */}
          <div
            className={`mb-4 category-slider ${
              categoryTabs.length >= 4 ? "four-or-more" : ""
            }`}
          >
            <Slider {...sliderSettingsTabs}>
              {categoryTabs.map((category) => (
                <div key={category} className="tab-slide">
                  <button
                    onClick={() => {
                      setActiveCategory(category);
                      setSelectedCategory(category);
                    }}
                    className={`btn category-tab ${
                      activeCategory === category
                        ? "active-tab"
                        : "inactive-tab"
                    }`}
                  >
                    {category}
                  </button>
                </div>
              ))}
            </Slider>
          </div>

          {/* Slider */}
          {displayProducts[selectedCategory]?.length > 1 ? (
            <Slider
              key={displayProducts[selectedCategory]?.length || 0}
              {...sliderSettings}
            >
              {displayProducts[selectedCategory]?.map((item, index) => (
                <div key={index} className="p-2 product-item">
                  <div
                    className="product-items position-relative text-center"
                    style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="product-img position-relative">
                      <div>
                        <img
                          src={
                            item?.images
                              ? baseFileURL + item.images[0]?.image
                              : item.image
                          }
                          alt={item.product}
                          className="img-fluid"
                        />
                      </div>
                    </div>

                    {/* product info */}
                    <div className="product-text mt-3">
                      <h5 className="text-truncate">{item.product}</h5>
                      <p className="text-muted" style={{ minHeight: "40px" }}>
                        {item?.details?.slice(0, 30)}...
                      </p>
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="cta"
                          onClick={() => setViewModal(item)}
                        >
                          <span>Read More</span>
                          <svg width="15px" height="10px" viewBox="0 0 13 10">
                            <path d="M1,5 L11,5"></path>
                            <polyline points="8 1 12 5 8 9"></polyline>
                          </svg>
                        </button>

                        <button
                          className="btn btn-outline-primary btn-sm"
                          style={{
                            border: "1.5px solid var(--color-secondary)",
                            borderRadius: "25px",
                            padding: "0px 6px",
                            fontWeight: "400",
                            letterSpacing: "0.5px",
                            transition: "all 0.3s ease",
                            color: "var(--color-secondary)",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor =
                              "var(--color-secondary)";
                            e.target.style.color = "#fff";
                            e.target.style.boxShadow =
                              "0 4px 12px rgba(13, 110, 253, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = "var(--color-secondary)";
                            e.target.style.boxShadow = "none";
                          }}
                          onClick={() => {
                            document
                              .getElementById("get-in-touch")
                              ?.scrollIntoView({
                                behavior: "smooth",
                              });
                          }}
                        >
                          Enquire Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            // 🔹 Jab ek hi product ho, normal render karo
            displayProducts[selectedCategory]?.map((item, index) => (
              <div
                key={index}
                className="p-2 product-item"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  // backgroundColor: "#fff", // white card
                  // borderRadius: "10px",

                  // boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  className="product-items position-relative text-center"
                  style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="product-img position-relative">
                    <div>
                      <img
                        src={
                          item?.images
                            ? baseFileURL + item.images[0]?.image
                            : item.image
                        }
                        alt={item.product}
                        className="img-fluid"
                      />
                    </div>
                  </div>

                  {/* product info */}
                  <div className="product-text mt-3">
                    <h5 className="text-truncate">{item.product}</h5>
                    <p className="text-muted" style={{ minHeight: "40px" }}>
                      {item?.details?.slice(0, 30)}...
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        className="cta"
                        onClick={() => setViewModal(item)}
                      >
                        <span>Read More</span>
                        <svg width="15px" height="10px" viewBox="0 0 13 10">
                          <path d="M1,5 L11,5"></path>
                          <polyline points="8 1 12 5 8 9"></polyline>
                        </svg>
                      </button>

                      <button
                        className="btn btn-outline-primary btn-sm"
                        style={{
                          border: "1.5px solid var(--color-secondary)",
                          borderRadius: "25px",
                          padding: "0px 6px",
                          fontWeight: "400",
                          letterSpacing: "0.5px",
                          transition: "all 0.3s ease",
                          color: "var(--color-secondary)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor =
                            "var(--color-secondary)";
                          e.target.style.color = "#fff";
                          e.target.style.boxShadow =
                            "0 4px 12px rgba(13, 110, 253, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "var(--color-secondary)";
                          e.target.style.boxShadow = "none";
                        }}
                        onClick={() => {
                          document
                            .getElementById("get-in-touch")
                            ?.scrollIntoView({
                              behavior: "smooth",
                            });
                        }}
                      >
                        Enquire Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      {viewModal && (
        <div
          className="modal fade show d-block"
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title" id="exampleModalLabel">
                  Product Modal
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setViewModal(null)} // Assuming you use this to close modal
                ></button>
              </div>

              <div className="modal-body">
                <div className="row">
                  {/* Left Column: Image and Video */}
                  <div className="col-lg-6">
                    <div id="productCarousel" data-bs-ride="carousel">
                      <div class="carousel-inner">
                        {viewModal?.images?.length > 0 && (
                          <Swiper
                            modules={[Autoplay, Navigation]}
                            spaceBetween={10}
                            slidesPerView={1}
                            navigation
                            autoplay={{
                              delay: 3000,
                              disableOnInteraction: false,
                            }}
                            loop={true}
                          >
                            {viewModal.images.map((img, index) => (
                              <SwiperSlide key={index}>
                                <img
                                  src={baseFileURL + img?.image}
                                  alt={`Product Image ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "cover",
                                  }}
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        )}
                      </div>

                      {/* Carousel controls (optional) */}
                    </div>

                    {viewModal?.video && (
                      <p className="mt-3">
                        <strong>Product Video:</strong>{" "}
                        <a
                          href={viewModal.video}
                          className="video-btn"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Product Video
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Right Column: Product Info */}
                  <div className="col-lg-6">
                    <h3 className="mb-3">
                      {viewModal?.product || "Product Name"}
                    </h3>

                    <p>
                      <strong>Category:</strong> {viewModal?.category}
                    </p>
                    <p>
                      <strong>ITC HS Code:</strong> {viewModal?.itc_hs_code}
                    </p>

                    {viewModal?.end_use_sectors && (
                      <p>
                        <strong>End Use Sectors:</strong>{" "}
                        {viewModal.end_use_sectors}
                      </p>
                    )}

                    {viewModal?.certification && (
                      <p>
                        <strong>Certification / Standard:</strong>{" "}
                        {viewModal.certification}
                      </p>
                    )}

                    {viewModal?.issue_date && (
                      <p>
                        <strong>Date of Issue:</strong> {viewModal.issue_date}
                      </p>
                    )}

                    {viewModal?.issuing_agency && (
                      <p>
                        <strong>Issuing Agency:</strong>{" "}
                        {viewModal.issuing_agency}
                      </p>
                    )}

                    {viewModal?.expiary_date && (
                      <p>
                        <strong>Date of Expiry:</strong>{" "}
                        {viewModal.expiary_date}
                      </p>
                    )}

                    {viewModal?.export_country &&
                      (() => {
                        let countries = "";
                        let data = viewModal.export_country;

                        // 🧠 Step 1: Try to unwrap nested escaped JSON multiple times
                        for (let i = 0; i < 5; i++) {
                          try {
                            const parsed = JSON.parse(data);
                            if (typeof parsed === "string") {
                              data = parsed; // keep unwrapping
                            } else {
                              data = parsed;
                              break;
                            }
                          } catch {
                            break;
                          }
                        }

                        // 🧹 Step 2: Normalize into comma-separated string
                        if (Array.isArray(data)) {
                          countries = data.join(", ");
                        } else if (typeof data === "string") {
                          countries = data
                            .replace(/^"+|"+$/g, "") // remove wrapping quotes
                            .replace(/\\"/g, '"') // unescape quotes
                            .split(",")
                            .map((c) => c.trim())
                            .filter(Boolean)
                            .join(", ");
                        }

                        return countries ? (
                          <p>
                            <strong>Export Countries:</strong> {countries}
                          </p>
                        ) : null;
                      })()}
                    {viewModal?.certificates?.length > 0 && (
                      <div>
                        <strong>Certificates</strong>
                        <Accordion defaultActiveKey="0">
                          {viewModal.certificates.map((cert, index) => (
                            <Accordion.Item
                              eventKey={index.toString()}
                              key={index}
                            >
                              <Accordion.Header>
                                Certificate {index + 1}: {cert.certificate}
                              </Accordion.Header>
                              <Accordion.Body>
                                <p>
                                  <strong>Certificates Name:</strong>{" "}
                                  {cert.certificate}
                                </p>
                                <p>
                                  <strong>Issuing Agency:</strong>{" "}
                                  {cert.issuing_agency}
                                </p>
                                <p>
                                  <strong>Date of Expiry:</strong>{" "}
                                  {cert.date_of_expiary}
                                </p>
                                <p>
                                  <strong>Date of Issue:</strong>{" "}
                                  {cert.date_of_issue}
                                </p>
                              </Accordion.Body>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                      </div>
                    )}

                    {viewModal?.details && (
                      <div>
                        <strong>Technical Details:</strong>

                        <p
                          style={{
                            whiteSpace: "pre-wrap", // ✅ wrap long unbroken text
                            marginTop: "4px",
                            wordBreak: "break-word", // ✅ ensures long words break instead of overflowing
                          }}
                        >
                          {(() => {
                            const text = viewModal.details.trim();

                            // Prevent errors if text is empty
                            if (!text) return "No technical details provided.";

                            const words = text.split(/\s+/).filter(Boolean);
                            const chars = text.length;

                            if (viewMore) return text;

                            // ✅ Limits
                            const WORD_LIMIT = 40;
                            const CHAR_LIMIT = 200;

                            // Word-based truncation
                            const limitedByWords = words
                              .slice(0, WORD_LIMIT)
                              .join(" ");

                            // Character-based truncation
                            const limitedByChars =
                              chars > CHAR_LIMIT
                                ? text.slice(0, CHAR_LIMIT) + "..."
                                : text;

                            // ✅ Choose whichever truncation is *shorter*
                            const preview =
                              limitedByWords.length < limitedByChars.length
                                ? limitedByWords +
                                  (text.length > limitedByWords.length
                                    ? "..."
                                    : "")
                                : limitedByChars;

                            return preview;
                          })()}
                        </p>

                        {(viewModal.details.length > 200 ||
                          viewModal.details.trim().split(/\s+/).filter(Boolean)
                            .length > 40) && (
                          <button
                            onClick={() => setViewMore(!viewMore)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#007bff",
                              padding: 0,
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                          >
                            {viewMore ? "View Less" : "View More"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsPreview;
