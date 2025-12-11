import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import {
  deleteTestimonials,
  getSection,
  getTestimonials,
  postTestimonials,
  postUpdateSection,
  updateTestimonials,
} from "../../services/draftApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";

export const demoTestimonials = [
  {
    id: "1",
    member_id: "10001",
    name: "Ravi Sharma",
    email: "ravi@example.com",
    designation: "Manager, TechCorp",
    testimonial:
      "This service has really helped us streamline our workflow. Highly recommended!",
    is_live: "1",
    status: "1",
    created_at: "2025-09-10 10:00:00",
    updated_at: "2025-09-10 10:00:00",
  },
  {
    id: "2",
    member_id: "10002",
    name: "Anita Verma",
    email: "anita@example.com",
    designation: "CEO, StartUpX",
    testimonial:
      "Amazing support and fast delivery. We are very happy with the results.",
    is_live: "1",
    status: "1",
    created_at: "2025-09-11 11:00:00",
    updated_at: "2025-09-11 11:00:00",
  },
  {
    id: "3",
    member_id: "10003",
    name: "Imran Khan",
    email: "imran@example.com",
    designation: null,
    testimonial:
      "Great experience! Everything worked as expected and saved us a lot of time.",
    is_live: "1",
    status: "1",
    created_at: "2025-09-12 12:00:00",
    updated_at: "2025-09-12 12:00:00",
  },
  {
    id: "4",
    member_id: "10004",
    name: "Priya Singh",
    email: "priya@example.com",
    designation: "Marketing Head, Brandify",
    testimonial:
      "User-friendly and efficient. Our team loves using this platform every day.",
    is_live: "1",
    status: "1",
    created_at: "2025-09-13 13:00:00",
    updated_at: "2025-09-13 13:00:00",
  },
  {
    id: "5",
    member_id: "10005",
    name: "Amit Patel",
    email: "amit@example.com",
    designation: "Founder, GreenWorld",
    testimonial:
      "The best solution we’ve come across in years. It really makes a difference.",
    is_live: "1",
    status: "1",
    created_at: "2025-09-14 14:00:00",
    updated_at: "2025-09-14 14:00:00",
  },
  {
    id: "6",
    member_id: "10006",
    name: "Suchi",
    email: "suchi@example.com",
    designation: null,
    testimonial:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    is_live: "1",
    status: "1",
    created_at: "2025-09-15 15:00:00",
    updated_at: "2025-09-15 15:00:00",
  },
];

const TestimonialsPreview = ({ memberId }) => {
  const {
    data: headerData,
    isLoading,
    isError,
    error: headerError,
  } = useQuery({
    queryKey: ["testimonial-draft"],
    queryFn: () => getTestimonials(memberId),
  });

  let data = headerData?.length > 0 ? headerData : [];

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
    centerMode: false,
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
    <section class="pb-100" style={{ position: "relative", marginTop: "50px" }}>
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

export default TestimonialsPreview;
