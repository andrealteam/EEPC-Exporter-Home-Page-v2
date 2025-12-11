import React, { useEffect, useState } from "react";
import Slider from "react-slick";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";
import { getLiveTestimonials } from "../../services/liveApi";
import Skeleton from "react-loading-skeleton";
const TestimonialLive = ({ website_url }) => {
  const {
    data: headerData,
    isLoading,
    isError,
    error: bannerError,
  } = useQuery({
    queryKey: ["testimonial-preview", website_url],
    queryFn: () => getLiveTestimonials(website_url),
  });

  let data = headerData || [];

  const settings = {
    dots: data.length > 1,
    infinite: data.length > 1,
    speed: 2000,
    autoplay: data.length > 1,
    autoplaySpeed: 3000,
    slidesToShow: data.length > 1 ? Math.min(data.length, 4) : 1,
    slidesToScroll: 1,
    arrows: data.length > 1,
    centerMode: false, // ✅ prevent stretch
    centerPadding: "0px", // ✅ no side padding
    centerMode: false, // or true if you want partial next slide visible

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: data.length > 2 ? 2 : data.length,
        },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="container" style={{ marginTop: "50px" }}>
        <div className=" mb-5 text-center">
          <Skeleton height={50} width={150} />
        </div>
        <Skeleton height={300} />
      </div>
    );
  }

  if (data?.length === 0) {
    return null;
  }
  return (
    <section style={{ position: "relative", marginTop: "60px" }}>
      <div class="">
        <div class="main-title mb-2 text-center mt-10">
          <div>
            <span>From Our Clients</span>
          </div>
        </div>

        <div className="testimonial-container" style={{ position: "relative" }}>
          {data?.length > 1 ? (
            <Slider {...settings}>
              {data?.map((item) => (
                <div className="testimonial-slide" key={item.id}>
                  <div>
                    <h3 className="testimonial-name">{item.name}</h3>
                    {item.designation && (
                      <p className="testimonial-role">{item.designation}</p>
                    )}
                  </div>
                  <div className="testimonial-card">
                    <p className="testimonial-message">“{item.testimonial}”</p>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {data?.map((item) => (
                <div
                  className="testimonial-slide"
                  key={item.id}
                  style={{ width: "50%" }}
                >
                  <div>
                    <h3 className="testimonial-name">{item.name}</h3>
                    {item.designation && (
                      <p className="testimonial-role">{item.designation}</p>
                    )}
                  </div>
                  <div className="testimonial-card">
                    <p className="testimonial-message">“{item.testimonial}”</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialLive;
