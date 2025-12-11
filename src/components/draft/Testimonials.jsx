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

const Testimonials = ({ memberId }) => {
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

  // Debugging

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
    queryKey: ["get-section-in-testimonial"],
    queryFn: () => getSection(memberId),
  });

  useEffect(() => {
    if (Array.isArray(sectionData) && sectionData.includes(8)) {
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
      queryClient.invalidateQueries(["testimonial-draft"]);
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

  const deleteProductData = async (id) => {
    setDeleteUndoModal(true);
    setIdData(id);
  };

  const updateSectionView = async () => {
    let sections = 8;
    let res = await postUpdateSection(memberId, sections);
    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["get-section-in-testimonial"]);
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
        queryClient.invalidateQueries(["testimonial-draft"]);
      } catch (error) {
        toast.error(res?.message);
      }
    }
  };
  const sliderLength = headerData?.length || 0;

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

        <div
          className="testimonial-container"
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            // alignItems: "center",
          }}
        >
          {data?.length > 1 ? (
            <Slider {...settings}>
              {data?.map((item) => (
                <div className="testimonial-slide" key={item.id}>
                  <div className="testimonial-card">
                    <div>
                      <h3 className="testimonial-name">{item.name}</h3>
                      {item.designation && (
                        <p className="testimonial-role">{item.designation}</p>
                      )}
                    </div>
                    <p className="testimonial-message">“{item.testimonial}”</p>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            data?.map((item) => (
              <div
                className="testimonial-slide"
                key={item.id}
                style={{
                  // width: "50%",
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  width: "50%",
                  marginLeft: "28%",
                }}
              >
                <div className="testimonial-card">
                  <h3 className="testimonial-name">{item.name}</h3>
                  {item.designation && (
                    <p className="testimonial-role">{item.designation}</p>
                  )}
                  <p className="testimonial-message">“{item.testimonial}”</p>
                </div>
              </div>
            ))
          )}

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

export default Testimonials;
