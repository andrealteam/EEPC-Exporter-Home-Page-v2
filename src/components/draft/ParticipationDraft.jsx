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
import { getPhysicalEvents } from "../../services/api";
import { Autoplay } from "swiper/modules";
const ParticipationDraft = ({ memberId }) => {
  const {
    data: headerData,
    isLoading,
    isError,
    error: headerError,
  } = useQuery({
    queryKey: ["physical-draft"],
    queryFn: () => getPhysicalEvents(memberId),
  });

  const eventIds = new Set(headerData?.message?.map((e) => e.EventId));

  const data =
    headerData?.fourthcoming_events?.filter((item) => eventIds.has(item.Id)) ||
    [];

  const [sectionItem, setSectionItem] = useState(false);
  const [deleteUndoMOdal, setDeleteUndoModal] = useState(false);
  const [addProduct, setAddProduct] = useState(false);
  useState(false);
  const [deleteUndeleteMOdal, setDeleteUndeleteModal] = useState(false);
  const [editedHeader, setEditedHeader] = useState({
    id: "",
    name: "",
    company: "",
    designation: "",
    message: "",
  });
  const [viewEditModal, setViewEditModal] = useState(null);
  const [idData, setIdData] = useState(null);

  const queryClient = useQueryClient();

  const { data: sectionData, error: sectionError } = useQuery({
    queryKey: ["get-section-in-participation"],
    queryFn: () => getSection(memberId),
  });

  useEffect(() => {
    if (Array.isArray(sectionData) && sectionData.includes(11)) {
      setSectionItem(true);
    } else {
      setSectionItem(false);
    }
  }, [sectionData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // You can send editedHeader.logoFile to server if file was changed
    let res = null;
    if (editedHeader.id) {
      res = await updateTestimonials(
        editedHeader.id,
        editedHeader.name,
        editedHeader.company,
        editedHeader.designation,
        editedHeader.message
      );
    } else {
      res = await postTestimonials(
        memberId,
        editedHeader.name,
        editedHeader.company,
        editedHeader.designation,
        editedHeader.message
      );
    }

    if (res.status) {
      toast.success(res?.message);
      // queryClient.invalidateQueries(["testimonial-draft"]);
      setAddProduct(false);
      setEditedHeader({
        id: "",
        name: "",
        company: "",
        designation: "",
        message: "",
      });
      setViewEditModal(null);
    } else {
      toast.error(res?.message);
    }
  };

  function closeModal() {
    setEditedHeader({
      id: "",
      name: "",
      company: "",
      designation: "",
      message: "",
    });
    setAddProduct(false);
    setViewEditModal(null);
  }

  const updateSectionView = async () => {
    let sections = 11;
    let res = await postUpdateSection(memberId, sections);
    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["get-section-in-participation"]);
      setDeleteUndeleteModal(false);
    } else {
      toast.error(res?.message);
    }
  };

  const deleteSpecificProduct = async (id) => {
    if (id) {
      let res;
      try {
        res = await deleteTestimonials(id);
        toast.success(res?.message);
        setDeleteUndoModal(false);
        setIdData(null);
        // queryClient.invalidateQueries(["testimonial-draft"]);
      } catch (error) {
        toast.error(res?.message);
      }
    }
  };

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

  if (data?.length === 0) {
    return <div></div>;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {headerError.message}</div>;
  }

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

  return (
    <section class="pb-100" style={{ position: "relative", marginTop: "50px" }}>
      <div class="">
        {/* <div class="main-title mb-2 text-center mt-10">
          <div>
            <span>Our Participation</span>
          </div>
        </div> */}
        <div class="main-title mb-2 text-center mt-10">
          <div>
            <span>Forthcoming Event Participation</span>
          </div>
        </div>

        <div
          className="testimonial-container1"
          style={{ position: "relative" }}
        >
          {/* <div
            className="remove-btn-sec btn"
            type="button"
            style={{
              background: sectionItem ? "red" : "green",
              zIndex: 9999,
            }}
            onClick={() => setDeleteUndeleteModal(true)}
          >
            {sectionItem ? (
              <FontAwesomeIcon style={{ color: "white" }} icon={faTrash} />
            ) : (
              <FontAwesomeIcon style={{ color: "white" }} icon={faPlus} />
            )}
          </div> */}
          {!sectionItem && (
            <div class="remove-section">
              <div class="remove-box">
                <p>Removed</p>
              </div>
            </div>
          )}
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

          {(addProduct || viewEditModal) && (
            <div
              className="modal fade show d-block"
              id="staticBackdrop"
              data-bs-backdrop="static"
              data-bs-keyboard="false"
              tabIndex="-1"
              aria-labelledby="staticBackdropLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3 className="modal-title" id="exampleModalLabel">
                      Add Testimonial
                    </h3>
                  </div>
                  <div className="modal-body">
                    <form>
                      <div className="row">
                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label htmlFor="productName" className="form-label">
                              Testimonial Name
                            </label>

                            <input
                              type="text"
                              name="name"
                              value={editedHeader.name}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label htmlFor="companyName" className="form-label">
                              Company Name
                            </label>

                            <input
                              type="text"
                              name="company"
                              value={editedHeader.company}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label htmlFor="productName" className="form-label">
                              Designation Name
                            </label>

                            <input
                              type="text"
                              name="designation"
                              value={editedHeader.designation}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label htmlFor="message" className="form-label">
                              Message
                            </label>

                            <input
                              type="text"
                              name="message"
                              value={editedHeader.message}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="btn btn-secondary" onClick={handleSave}>
                        Save Details
                      </div>

                      <div
                        type="button"
                        className="btn btn-primary mx-2"
                        onClick={closeModal}
                      >
                        Cancel
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {deleteUndeleteMOdal &&
            (sectionItem ? (
              <div
                className="modal d-block"
                tabIndex="-1"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 1050,
                }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-body text-center">
                      <h4 className="mb-4">
                        Do You Want to Remove this Section from your Live
                        Website.
                      </h4>
                      <button
                        type="button"
                        className="btn btn-secondary mx-2"
                        onClick={updateSectionView}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary mx-2"
                        onClick={() => setDeleteUndeleteModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="modal d-block"
                tabIndex="-1"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 1050,
                }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-body text-center">
                      <h4 className="mb-4">
                        Would you like to publish this section on your live
                        website?
                      </h4>
                      <button
                        type="button"
                        className="btn btn-secondary mx-2"
                        onClick={updateSectionView}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary mx-2"
                        onClick={() => setDeleteUndeleteModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {deleteUndoMOdal && (
            <div
              className="modal d-block"
              tabIndex="-1"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 1050,
              }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-body text-center">
                    <h4 className="mb-4">
                      Do You Want to remove this Testimonial on your Live
                      Website.
                    </h4>
                    <button
                      type="button"
                      className="btn btn-secondary mx-2"
                      onClick={() => deleteSpecificProduct(idData)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary mx-2"
                      onClick={() => setDeleteUndoModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ParticipationDraft;
