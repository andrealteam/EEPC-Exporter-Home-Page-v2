import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { baseFileURL, getPhysicalEvents } from "../../services/api";

const ParticipationLIve = ({ member_id }) => {
  const {
    data: headerData,
    isLoading,
    isError,
    error: headerError,
  } = useQuery({
    queryKey: ["physicalPreview-live"],
    queryFn: () => getPhysicalEvents(member_id),
  });

  // console.log("Participation Preview Data:", headerData);
  const eventIds = new Set(headerData?.message?.map((e) => e.EventId));

  const data =
    headerData?.fourthcoming_events?.filter((item) => eventIds.has(item.Id)) ||
    [];

  const settings = {
    dots: data?.length > 1, // ek item h to dots bhi hat jayenge
    infinite: data?.length > 1, // sirf 2 ya zyada item h to loop
    speed: 2000,
    slidesToShow: data?.length > 1 ? 1 : 1, // ek h to bhi 1
    slidesToScroll: 1,
    autoplay: data?.length > 1, // autoplay sirf multiple items pe
    autoplaySpeed: 4000,
    arrows: data?.length > 1, // ek hi item h to arrows off
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(data?.length, 2) },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  // console.log("Filtered Participation Data:", data);

  if (data?.length === 0) {
    return null;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {headerError.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="container" style={{ marginTop: "60px" }}>
        <div className=" mb-5 text-center">
          <Skeleton height={50} width={150} />
        </div>
        <Skeleton height={300} />
      </div>
    );
  }

  return (
    <section style={{ position: "relative", marginTop: "60px" }}>
      <div class="">
        <div class="main-title mb-2 text-center mt-10">
          <div>
            <span>Forthcoming Event Participation</span>
          </div>
        </div>

        <div
          className="testimonial-container1"
          style={{ position: "relative" }}
        >
          <Slider {...settings}>
            {data?.map((item) => (
              <div
                key={item.EventId}
                className="event-card"
                style={{
                  borderRadius: "18px",
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  background: "#ffffff",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  border: "1px solid #f2f2f2",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  {item.EventLogo && (
                    <img
                      src={"https://app.eepcindia.com/ems/" + item.EventLogo}
                      alt={item.EventShortTitle}
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "contain",
                        borderRadius: "10px",
                        background: "#fafafa",
                        padding: "6px",
                      }}
                    />
                  )}

                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#1b1b1b",
                      }}
                    >
                      {item.EventShortTitle}
                    </h3>

                    <p
                      style={{
                        margin: "4px 0",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      {item.EventCity}
                    </p>
                  </div>
                </div>

                {/* Event Details */}
                <div
                  style={{
                    fontSize: "15px",
                    color: "#333",
                    marginTop: "4px",
                  }}
                >
                  <p style={{ margin: "6px 0" }}>
                    <strong>📅 Dates:</strong> {item.EventStartDate} –{" "}
                    {item.EventEndDate}
                  </p>

                  {item.BoothSelected && (
                    <p style={{ margin: "6px 0" }}>
                      <strong>🏢 Booth:</strong> {item.BoothSelected} (
                      {item.BoothSize} sqm)
                    </p>
                  )}

                  {item.ExhibitorId && (
                    <p style={{ margin: "6px 0" }}>
                      <strong>🆔 Exhibitor ID:</strong> {item.ExhibitorId}
                    </p>
                  )}

                  {/* {item.TotalAmountPaid && (
                      <p style={{ margin: "6px 0" }}>
                        <strong>💳 Amount Paid:</strong> ₹{item.TotalAmountPaid}
                      </p>
                    )} */}

                  {item.RegistartionDate && (
                    <p style={{ margin: "6px 0" }}>
                      <strong>📝 Registered On:</strong> {item.RegistartionDate}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default ParticipationLIve;
