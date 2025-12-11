import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { demoLogo } from "../../utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import {
  getBanner,
  getCountry,
  getHeader,
  getSection,
  getWhoWeAre,
  postUpdateSection,
  postWhoWeAre,
} from "../../services/draftApi";

import { baseFileURL } from "../../services/api";
import {
  faArrowDown,
  faPen,
  faPlay,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const WhoWeAreDraft = ({ memberId }) => {
  const [openViewEdit, setOpenViewEdit] = useState(false);
  const [sectionItem, setSectionItem] = useState(false);
  const [deleteUndoMOdal, setDeleteUndoModal] = useState(false);

   

  const { data: sectionData, error: sectionError } = useQuery({
    queryKey: ["get-section-in-whowe"],
    queryFn: () => getSection(memberId),
  });

  useEffect(() => {
    if (Array.isArray(sectionData) && sectionData.includes(4)) {
      setSectionItem(true);
    } else {
      setSectionItem(false);
    }
  }, [sectionData]);

   

  const updateSectionView = async () => {
    let sections = 4;
    let res = await postUpdateSection(memberId, sections);
    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["get-section-in-whowe"]);
      setDeleteUndoModal(false);
    } else {
      toast.error(res?.message);
    }
  };

  const {
    data: whoWeData,
    isLoading,
    isError,
    error: whoWeError,
  } = useQuery({
    queryKey: ["whoWe-draft"],
    queryFn: () => getWhoWeAre(memberId),
  });

  const [editedBanner, setEditedBanner] = useState({
    nature_of_business: "",
    additional_business: "",
    company_ceo: "",
    registered_address: "",
    total_employees: "",
    year_of_est: "",
    firm_status: "",
    annual_turnover: "",
    video_link: "",
  });

  useEffect(() => {
    if (whoWeData) {
      setEditedBanner({
        nature_of_business: whoWeData.nature_of_business,
        additional_business: whoWeData.additional_business,
        company_ceo: whoWeData.company_ceo,
        registered_address: whoWeData.registered_address,
        total_employees: whoWeData.total_employees,
        year_of_est: whoWeData.year_of_est,
        firm_status: whoWeData.firm_status,
        annual_turnover: whoWeData.annual_turnover,
        video_link: "",
      });
    }
  }, [whoWeData]);

  // Extract YouTube Video ID
  const getYouTubeID = (url) => {
    const regex =
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/;
    const match = url?.match(regex);
    return match ? match[1] : null;
  };

  const videoID = getYouTubeID(
    editedBanner.video_link ? editedBanner.video_link : whoWeData?.video_link
  );
  const thumbnailURL = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
  const videoURL = `https://www.youtube.com/watch?v=${videoID}`;

  const handleCancel = () => {
    setOpenViewEdit(false);
  };
  const queryClient = useQueryClient();
  const handleSave = async () => {
    // You can send editedHeader.logoFile to server if file was changed
    let res = await postWhoWeAre(
      memberId,
      editedBanner.nature_of_business,
      editedBanner.additional_business,
      editedBanner.company_ceo,
      editedBanner.registered_address,
      editedBanner.total_employees,
      editedBanner.year_of_est,
      editedBanner.firm_status,
      editedBanner.annual_turnover,
      editedBanner.video_link
    );
    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["whoWe-draft"]);
      setOpenViewEdit(false);
    } else {
      toast.error(res?.message);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBanner((prev) => ({ ...prev, [name]: value }));
  };


  if (isError)
    return <p>Error: {whoWeError.message || "Something went wrong!"}</p>;

  return (
    <>
      {openViewEdit ? (
        <section class="pb-100" style={{ position: "relative" }}>
          <div className="update-btn" style={{ zIndex: 9999 }}>
            <button className="edit-btn-2 btn-primary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="edit-btn-1 btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
          <div class="container">
            <div class="row">
              <div class="col-lg-6">
                <div class="table-card">
                  <div class="main-title">
                    <div>
                      <span>Basic Information</span>
                      <h2>
                        Who we are
                        <button class="edit-btn">
                          <i class="fa-solid fa-pencil"></i>
                        </button>
                      </h2>
                    </div>
                  </div>
                  <div class="table-responsive basic-info-table">
                    <table class="table">
                      <tbody>
                        <tr>
                          <th scope="row" class="">
                            Exporter and Manufacturer
                          </th>
                          <td>
                            <input
                              type="text"
                              name="nature_of_business"
                              value={editedBanner.nature_of_business}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Additional Business
                          </th>
                          <td>
                            <input
                              type="text"
                              name="additional_business"
                              value={editedBanner.additional_business}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Company CEO
                          </th>
                          <td>
                            <input
                              type="text"
                              name="company_ceo"
                              value={editedBanner.company_ceo}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Registered Address
                          </th>
                          <td>
                            <input
                              type="text"
                              name="registered_address"
                              value={editedBanner.registered_address}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Total Number of Employees
                          </th>
                          <td>
                            <input
                              type="text"
                              name="total_employees"
                              value={editedBanner.total_employees}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Year of Establishment
                          </th>
                          <td>
                            <input
                              type="text"
                              name="year_of_est"
                              value={editedBanner.year_of_est}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Legal Status of Firm
                          </th>
                          <td>
                            <input
                              type="text"
                              name="firm_status"
                              value={editedBanner.firm_status}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Annual Turnover
                          </th>
                          <td>
                            <input
                              type="text"
                              name="annual_turnover"
                              value={editedBanner.annual_turnover}
                              onChange={handleInputChange}
                              className="form-control"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="video-wrapper">
                  <div class="corporate-video-wrapper position-relative">
                    <div class="corporate-video position-relative">
                      {/* <img src="./assets/images/about.jpg" alt=""/> */}
                      <div>
                        <input
                          type="text"
                          name="video_link"
                          value={
                            editedBanner.video_link
                              ? editedBanner.video_link
                              : whoWeData?.video_link
                          }
                          onChange={handleInputChange}
                          className="form-control"
                        />
                        <a
                          href={videoURL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={thumbnailURL}
                            alt="YouTube Video Thumbnail"
                          />
                          <FontAwesomeIcon
                            icon={faPlay}
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              fontSize: "48px",
                              color: "white",
                              // background: 'rgba(0, 0, 0, 0.5)',
                              borderRadius: "50%",
                              padding: "10px",
                            }}
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section class="pb-100" style={{ position: "relative" }}>
          {sectionItem && (
            <button
              className="update-btn"
              style={{ zIndex: 9999 }}
              onClick={() => {
                // console.log("clicked");
                setOpenViewEdit(true);
              }}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
          )}
          <div
            className="remove-btn-sec btn"
            type="button"
            style={{ background: sectionItem ? "red" : "green", zIndex: 9999 }}
            onClick={() => setDeleteUndoModal(true)}
          >
            {sectionItem ? (
              <FontAwesomeIcon style={{ color: "white" }} icon={faTrash} />
            ) : (
              <FontAwesomeIcon style={{ color: "white" }} icon={faPlus} />
            )}
          </div>
          {!sectionItem && (
            <div class="remove-section">
              <div class="remove-box">
                <p>Removed</p>
              </div>
            </div>
          )}
          <div class="container">
            <div class="row">
              <div class="col-lg-6">
                <div class="table-card">
                  <div class="main-title">
                    <div>
                      <span>Basic Information</span>
                      <h2>
                        Who we are
                        <button class="edit-btn">
                          <i class="fa-solid fa-pencil"></i>
                        </button>
                      </h2>
                    </div>
                  </div>
                  <div class="table-responsive basic-info-table">
                    <table class="table">
                      <tbody>
                        <tr>
                          <th scope="row" class="">
                            Exporter and Manufacturer
                          </th>
                          <td>{whoWeData?.nature_of_business}</td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Additional Business
                          </th>
                          <td>{whoWeData?.additional_business}</td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Company CEO
                          </th>
                          <td>{whoWeData?.company_ceo}</td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Registered Address
                          </th>
                          <td>{whoWeData?.registered_address}</td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Total Number of Employees
                          </th>
                          <td>{whoWeData?.total_employees}</td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Year of Establishment
                          </th>
                          <td>{whoWeData?.year_of_est}</td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Legal Status of Firm
                          </th>
                          <td>{whoWeData?.firm_status}</td>
                        </tr>
                        <tr>
                          <th scope="row" class="">
                            Annual Turnover
                          </th>
                          <td>{whoWeData?.annual_turnover}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="video-wrapper">
                  <div class="corporate-video-wrapper position-relative">
                    <div class="corporate-video position-relative">
                      {/* <img src="./assets/images/about.jpg" alt=""/> */}
                      <div>
                        <a
                          href={videoURL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={thumbnailURL}
                            alt="YouTube Video Thumbnail"
                          />
                          <FontAwesomeIcon
                            icon={faPlay}
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              fontSize: "48px",
                              color: "white",
                              // background: 'rgba(0, 0, 0, 0.5)',
                              borderRadius: "50%",
                              padding: "10px",
                            }}
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {deleteUndoMOdal &&
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
                        onClick={() => setDeleteUndoModal(false)}
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
                        onClick={() => setDeleteUndoModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </section>
      )}
    </>
  );
};

export default WhoWeAreDraft;
