import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { demoLogo } from "../../utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import Select from "react-select";
import {
  deleteGallery,
  deleteGalleryImage,
  deleteImage,
  deleteProduct,
  getBanner,
  getCountry,
  getGallery,
  getHeader,
  getProducts,
  getSection,
  postGallery,
  postProducts,
  postUpdateSection,
} from "../../services/draftApi";

import { baseFileURL } from "../../services/api";
import {
  faArrowDown,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const GalleryPreview = ({ memberId }) => {
  const {
    data: productsData,
    isLoading,
    isError,
    error: bannerError,
  } = useQuery({
    queryKey: ["gallery-preview", memberId],
    queryFn: () => getGallery(memberId),
  });

  const [viewModal, setViewModal] = useState(null);

  useEffect(() => {
    if (viewModal) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    // Clean up when component unmounts
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [viewModal]);

  return (
    <>
      <section class="pb-100" style={{ position: "relative" }}>
        <div class="container">
          <div class="row">
            {productsData?.map((item, index) => (
              <div
                key={index}
                class="col-lg-3"
                onClick={() => setViewModal(item)}
              >
                <div class="product-items position-relative">
                  <div class="product-img position-relative">
                    <a
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    >
                      <img src={baseFileURL + item?.cover_image} alt="" />
                    </a>
                  </div>

                  <div class="product-text">
                    <a
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    >
                      {item?.gallery}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {viewModal && (
        <div
          className="modal fade show d-block"
          style={{ zIndex: 99999 }}
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title" id="exampleModalLabel">
                  {viewModal?.gallery}
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setViewModal(null)} // Assuming you use this to close modal
                ></button>
              </div>

              <div
                className="modal-body"
                style={{ height: "90vh", overflowY: "scroll" }}
              >
                <div className="row">
                  <div className="col-lg-12">
                    <div className="gallery-grid">
                      {viewModal?.images?.map((img, index) => (
                        <div className="gallery-item" key={index}>
                          <img
                            src={baseFileURL + img?.image}
                            alt={`Image ${index + 1}`}
                            className="gallery-img"
                          />
                        </div>
                      ))}
                    </div>
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

export default GalleryPreview;
