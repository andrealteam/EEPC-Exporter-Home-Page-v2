import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { demoLogo } from "../../utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import Select from "react-select";

import {
  getAbout,
  getBanner,
  getCountry,
  getHeader,
  getSection,
  getWhoWeAre,
  postUpdateSection,
  postWhoWeAreSection,
} from "../../services/draftApi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { baseFileURL } from "../../services/api";
import {
  faArrowDown,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import Loader from "../Loader";
import { useChangeTracker } from "../../contexts/ChangeTrackerContext";

let demoAboutContent = `<p>
  We are a leading company in our industry, committed to providing top-quality products and services to our customers worldwide. Our mission is to innovate and excel in everything we do, ensuring customer satisfaction and fostering long-term relationships.
</p>
<p>
  With a team of dedicated professionals, we strive to exceed expectations and deliver exceptional value. Our core values include integrity, excellence, teamwork, and customer focus, which guide us in our daily operations and decision-making processes.
</p>
<p>
  We believe in continuous improvement and are always looking for ways to enhance our offerings and stay ahead of industry trends. Our commitment to sustainability and social responsibility is reflected in our business practices and community involvement.
</p>
<p>
  Join us on our journey as we continue to grow and make a positive impact in the world. Thank you for choosing us as your trusted partner.
</p>
<p>
  With a team of dedicated professionals, we strive to exceed expectations and deliver exceptional value. Our core values include integrity, excellence, teamwork, and customer focus, which guide us in our daily operations and decision-making processes.
</p>
<p>
  With a team of dedicated professionals, we strive to exceed expectations and deliver exceptional value. Our core values include integrity, excellence, teamwork, and customer focus, which guide us in our daily operations and decision-making processes.
</p>
<p>
  With a team of dedicated professionals, we strive to exceed expectations and deliver exceptional value. Our core values include integrity, excellence, teamwork, and customer focus, which guide us in our daily operations and decision-making processes.
</p>
`;

const AboutDraft = ({ memberId }) => {
  const { markAsChanged } = useChangeTracker();
  const [openViewEdit, setOpenViewEdit] = useState(false);
  const [sectionItem, setSectionItem] = useState(false);
  const [deleteUndoMOdal, setDeleteUndoModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    data: aboutData,
    isLoading,
    isError,
    error: aboutError,
  } = useQuery({
    queryKey: ["about-draft"],
    queryFn: () => getWhoWeAre(memberId),
  });

  const { data: countryData, error: countryError } = useQuery({
    queryKey: ["country-draft"],
    queryFn: getCountry,
  });

  const { data: sectionData, error: sectionError } = useQuery({
    queryKey: ["get-section-in-about"],
    queryFn: () => getSection(memberId),
  });

  useEffect(() => {
    if (Array.isArray(sectionData) && sectionData.includes(3)) {
      setSectionItem(true);
    } else {
      setSectionItem(false);
    }
  }, [sectionData]);

  const countryOptions = countryData?.map((item) => ({
    value: item.country,
    label: item.country,
  }));


  const [editedBanner, setEditedBanner] = useState({
    about_content: "",
    nature_of_business: "",
    additional_business: "",
    company_ceo: "",
    registered_address: "",
    total_employees: "",
    year_of_est: "",
    firm_status: "",
    annual_turnover: "",
    export_destination: [],
  });


  useEffect(() => {
    if (aboutData) {
      setEditedBanner({
        about_content: aboutData.about_content,
        nature_of_business: aboutData.nature_of_business,
        additional_business: aboutData.additional_business,
        company_ceo: aboutData.company_ceo,
        registered_address: aboutData.registered_address,
        total_employees: aboutData.total_employees,
        year_of_est: aboutData.year_of_est,
        firm_status: aboutData.firm_status,
        annual_turnover: aboutData.annual_turnover,
        export_destination: aboutData.export_destination,
      });
    }
  }, [aboutData]);

  const handleCancel = () => {
    setOpenViewEdit(false);
  };
  const queryClient = useQueryClient();
  const handleSave = async () => {
    setLoading(true);
    const cleanedValue = editedBanner.about_content
      .replace(/<(p|div)><br><\/\1>/gi, "")
      .trim();
    let res = await postWhoWeAreSection(
      memberId,
      cleanedValue,
      editedBanner.nature_of_business,
      editedBanner.additional_business,
      editedBanner.company_ceo,
      editedBanner.registered_address,
      editedBanner.total_employees,
      editedBanner.year_of_est,
      editedBanner.firm_status,
      editedBanner.annual_turnover,
      editedBanner.export_destination
    );
    if (res.status) {
      setLoading(false);
      toast.success(res?.message);
      queryClient.invalidateQueries(["about-draft"]);
      setOpenViewEdit(false);
    } else {
      setLoading(false);
      toast.error(res?.message);
    }
  };

  const updateSectionView = async () => {
    let sections = 3;
    let res = await postUpdateSection(memberId, sections);
    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["get-section-in-about"]);
      setDeleteUndoModal(false);
    } else {
      toast.error(res?.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBanner((prev) => ({ ...prev, [name]: value }));
    markAsChanged();
  };

  // Convert HTML to plain text to count words
  const plainText =
    aboutData?.about_content || demoAboutContent
      ? DOMPurify.sanitize(aboutData?.about_content || demoAboutContent, {
        ALLOWED_TAGS: [],
      })
      : "";

  const words = plainText.split(/\s+/);
  const isLong = words.length > 100;

  // Show only first 300 words if not expanded
  const truncatedText = words.slice(0, 300).join(" ") + "...";


  // if (isError)
  //   return <p>Error: {aboutError.message || "Something went wrong!"}</p>;

  if (isLoading) {
    return (
      <div class="row" style={{ marginBottom: "80px" }}>
        <div class="col-lg-6">
          <Skeleton height={500} />
        </div>
        <div class="col-lg-6">
          <Skeleton height={500} />
        </div>
      </div>
    );
  }

  return (
    <>
      {loading && <Loader isLoading={loading} />}
      {openViewEdit ? (
        <>
          <section style={{ position: "relative", paddingTop: "60px" }}>
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
                <div class="col-12">
                  <div class="company-card">
                    {/* <div class="main-title">
                      <div>
                        <span>About our company</span>

                       
                        <ReactQuill
                          value={editedBanner.about_content}
                          onChange={(value) => {
                            setEditedBanner((prev) => ({
                              ...prev,
                              about_content: value,
                            }));
                            markAsChanged();
                          }}
                        />
                      </div>
                    </div> */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div class="main-title">
                        <span>About our company</span>
                      </div>
                      <ReactQuill
                        style={{ width: "100%" }}
                        value={editedBanner.about_content}
                        onChange={(value) => {
                          setEditedBanner((prev) => ({
                            ...prev,
                            about_content: value, // keep raw Quill value while typing
                          }));
                          markAsChanged();
                        }}
                      />

                    </div>
                  </div>
                </div>
                <div class="col-12" style={{ marginTop: "30px" }}>
                  <div class="company-card">
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
                                  type="number"
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
                                  type="number"
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
                            <tr>
                              <th scope="row" class="">
                                Export Destinations
                              </th>
                              <td>
                                <Select
                                  isMulti
                                  closeMenuOnSelect={false}
                                  name="export_country"
                                  options={countryOptions}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  placeholder="Search and select countries..."
                                  menuPortalTarget={document.body}
                                  styles={{
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                  }}
                                  onChange={(selectedOptions) => {

                                    // ✅ Enforce max 10 selections
                                    if (selectedOptions.length > 10) {
                                      // Optionally show alert
                                      alert("You can select a maximum of 10 countries.");
                                      return; // ❌ Stop update
                                    }

                                    const selectedCountries = selectedOptions?.map((opt) => opt.value);

                                    setEditedBanner((prev) => ({
                                      ...prev,
                                      export_destination: selectedCountries,
                                    }));
                                  }}
                                  value={countryOptions.filter((opt) =>
                                    editedBanner.export_destination.includes(opt.value)
                                  )}
                                />


                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <section
            style={{ position: "relative", paddingTop: "60px" }}
            className="about-section"
          >
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

            {/* <div
              className="remove-btn-sec btn"
              type="button"
              style={{
                background: sectionItem ? "red" : "green",
                zIndex: 9999,
              }}
              onClick={() => setDeleteUndoModal(true)}
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
            <div class="row">
              <div class="col-lg-6">
                <div class="company-card">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="main-title">
                      <div>
                        <span>About our company</span>
                      </div>
                    </div>
                    <div>
                      <div
                        className={expanded || !isLong ? "" : "truncated"}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(aboutData?.about_content),
                        }}
                      />


                      {isLong && (
                        <button
                          onClick={() => setExpanded(!expanded)}
                          style={{
                            color: "blue",
                            cursor: "pointer",
                            marginTop: "10px",
                          }}
                        >
                          {expanded ? (
                            <button class="learn-more read-more">
                              <span class="circle" aria-hidden="true">
                                <span class="icon arrow"></span>
                              </span>
                              <span class="button-text">Read Less</span>
                            </button>
                          ) : (
                            <button class="learn-more read-more">
                              <span class="circle" aria-hidden="true">
                                <span class="icon arrow"></span>
                              </span>
                              <span class="button-text">Read More</span>
                            </button>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="company-card">
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
                              {aboutData?.nature_of_business ||
                                "Textile Fabrics & Garments (Demo)"}
                            </td>
                          </tr>

                          <tr>
                            <th scope="row" class="">
                              Additional Business
                            </th>
                            <td>
                              {aboutData?.additional_business ||
                                "Wholesale Trading, Importing (Demo)"}
                            </td>
                          </tr>

                          <tr>
                            <th scope="row" class="">
                              Company CEO
                            </th>
                            <td>
                              {aboutData?.company_ceo ||
                                "Mr. Rajesh Sharma (Demo)"}
                            </td>
                          </tr>

                          <tr>
                            <th scope="row" class="">
                              Registered Address
                            </th>
                            <td>
                              {aboutData?.registered_address ||
                                "Plot No. 45, Industrial Area, New Delhi - 110015, India (Demo)"}
                            </td>
                          </tr>

                          <tr>
                            <th scope="row" class="">
                              Total Number of Employees
                            </th>
                            <td>
                              {aboutData?.total_employees ||
                                "51–100 People (Demo)"}
                            </td>
                          </tr>

                          <tr>
                            <th scope="row" class="">
                              Year of Establishment
                            </th>
                            <td>{aboutData?.year_of_est || "2008 (Demo)"}</td>
                          </tr>

                          <tr>
                            <th scope="row" class="">
                              Legal Status of Firm
                            </th>
                            <td>
                              {aboutData?.firm_status ||
                                "Private Limited Company (Demo)"}
                            </td>
                          </tr>

                          <tr>
                            <th scope="row" class="">
                              Annual Turnover
                            </th>
                            <td>
                              {aboutData?.annual_turnover ||
                                "₹50–100 Crore (Demo)"}
                            </td>
                          </tr>

                          <tr>
                            <th scope="row" class="">
                              Export Destinations
                            </th>
                            <td>
                              {aboutData?.export_destination &&
                                (() => {
                                  let data = aboutData.export_destination;
                                  let countries = "";

                                  // 🧠 Step 1: Deeply unwrap up to 15 times (handles all levels)
                                  for (let i = 0; i < 15; i++) {
                                    if (typeof data !== "string") break;
                                    const trimmed = data.trim();

                                    try {
                                      const parsed = JSON.parse(trimmed);
                                      data = parsed;
                                    } catch {
                                      // try one last unescape pass before giving up
                                      const unescaped = trimmed
                                        .replace(/\\\\/g, "\\")
                                        .replace(/\\"/g, '"');
                                      if (unescaped !== trimmed) {
                                        data = unescaped;
                                        continue;
                                      }
                                      break;
                                    }
                                  }

                                  // 🧹 Step 2: Normalize data
                                  if (Array.isArray(data)) {
                                    countries = data.join(", ");
                                  } else if (typeof data === "string") {
                                    countries = data
                                      .replace(/\\/g, "") // remove extra backslashes
                                      .replace(/^"+|"+$/g, "") // remove wrapping quotes
                                      .split(",")
                                      .map((c) => c.trim())
                                      .filter(Boolean)
                                      .join(", ");
                                  }

                                  // 🧾 Step 3: Safe fallback if still nothing parsed
                                  if (
                                    !countries &&
                                    typeof aboutData.export_destination === "string"
                                  ) {
                                    countries = aboutData.export_destination
                                      .replace(/\\/g, "")
                                      .replace(/^"+|"+$/g, "")
                                      .split(",")
                                      .map((c) => c.trim())
                                      .filter(Boolean)
                                      .join(", ");
                                  }

                                  const isEmpty =
                                    !countries ||
                                    countries.trim() === "" ||
                                    countries.trim() === "[]" ||
                                    countries.replace(/[\[\]]/g, "").trim() === "";

                                  return !isEmpty ? (
                                    <p>{countries}</p>
                                  ) : (
                                    <p>USA, UK, Germany, Australia, Middle East (Demo)</p>
                                  );
                                })()}

                              {/* {aboutData?.export_destination ||
                                "USA, UK, Germany, Australia, Middle East (Demo)"} */}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-100 about-img">
              {/* <div class="container">
                <img src={baseFileURL + aboutData?.about_image} alt="" />
              </div> */}

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
                            Want to Remove this Section from your Live Website.
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
                            Do You Want to add this Section on your Live
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
                ))}
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default AboutDraft;
