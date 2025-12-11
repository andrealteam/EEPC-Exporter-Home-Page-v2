import React from "react";
import { getBanner, getCertificates } from "../../services/draftApi";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { baseFileURL } from "../../services/api";

function CertificatePreview({ memberId }) {
  const {
    data: headerData,
    isLoading,
    isError,
    error: bannerError,
  } = useQuery({
    queryKey: ["certificate-preview", memberId],
    queryFn: () => getCertificates(memberId),
  });
  return (
    <section style={{ position: "relative", marginTop: "50px" }}>
      <div class="container mt-10">
        <div class="row">
          {headerData?.map((item, index) => (
            <div
              key={index}
              class="col-lg-3"
              // onClick={() => setViewModal(item)}
            >
              <div class="product-items position-relative">
                <div class="product-img position-relative">
                  <a
                    href="#"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                  >
                    <img src={baseFileURL + item?.certificates} alt="" />
                  </a>
                </div>

                <div class="product-text">
                  <a
                    href="#"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                  >
                    {item?.name}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CertificatePreview;
