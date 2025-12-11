import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  deleteCertificates,
  getCertificates,
  getSection,
  postCertificates,
  postUpdateSection,
  updateCertificates,
} from "../../services/draftApi";
import { baseFileURL } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const CertificateDraft = ({ memberId }) => {
  const {
    data: headerData,
    isLoading,
    isError,
    error: headerError,
  } = useQuery({
    queryKey: ["certificate-draft"],
    queryFn: () => getCertificates(memberId),
  });

  const { data: sectionData, error: sectionError } = useQuery({
    queryKey: ["get-section-in-certificate"],
    queryFn: () => getSection(memberId),
  });

  const [addProduct, setAddProduct] = useState(false);
  const [deleteUndoMOdal, setDeleteUndoModal] = useState(false);
  const [deleteUndeleteMOdal, setDeleteUndeleteModal] = useState(false);

  const [idData, setIdData] = useState(null);
  const [openViewEdit, setOpenViewEdit] = useState(false);
  const [sectionItem, setSectionItem] = useState(false);

  const [editedHeader, setEditedHeader] = useState({
    id: "",
    certificates: "",
    name: "",
    certificatesFile: null,
  });
  const [viewEditModal, setViewEditModal] = useState(null);

  // useEffect(() => {
  //   if (headerData) {
  //     setEditedHeader({
  //       certificates: "",
  //       name: headerData.name || "",

  //       certificatesFile: null,
  //     });
  //   }
  // }, [headerData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedHeader((prev) => ({ ...prev, [name]: value }));
  };

  const queryClient = useQueryClient();
  const handleSave = async () => {
    // You can send editedHeader.logoFile to server if file was changed
    let res = null;
    if (editedHeader.id) {
      res = await updateCertificates(
        editedHeader.id,
        memberId,
        editedHeader.name,
        editedHeader.certificatesFile
      );
    } else {
      res = await postCertificates(
        memberId,
        editedHeader.name,
        editedHeader.certificatesFile
      );
    }

    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["certificate-draft"]);
      setAddProduct(false);
      setEditedHeader({
        id: "",
        certificates: "",
        name: "",
        certificatesFile: null,
      });
      setViewEditModal(null);
    } else {
      toast.error(res?.message);
    }
  };

  function closeModal() {
    // setEditedHeader({
    //   id: "",
    //   exporter_id: "",
    //   category: "",
    //   product: "",
    //   itc_hs_code: "",
    //   end_use_sectors: "",
    //   image: [], // change from string to array
    //   imageFile: [],
    //   video: "",
    //   certification: "",
    //   issue_date: "",
    //   issuing_agency: "",
    //   expiary_date: "",
    //   export_country: [],
    //   details: "",
    // });
    setEditedHeader({
      id: "",
      certificates: "",
      name: "",
      certificatesFile: null,
    });
    setAddProduct(false);
    setViewEditModal(null);
  }

  function editFunction(data) {
    setEditedHeader({
      id: data?.id,
      name: data?.name,
    });
    setViewEditModal(data);
  }

  const deleteProductData = async (id) => {
    setDeleteUndoModal(true);
    setIdData(id);
  };

  const deleteSpecificProduct = async (id) => {
    if (id) {
      let res;
      try {
        res = await deleteCertificates(id);
        toast.success(res?.message);
        setDeleteUndoModal(false);
        setIdData(null);
        queryClient.invalidateQueries(["certificate-draft"]);
      } catch (error) {
        toast.error(res?.message);
      }
    }
  };

  const updateSectionView = async () => {
    let sections = 7;
    let res = await postUpdateSection(memberId, sections);
    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["get-section-in-certificate"]);
      setDeleteUndeleteModal(false);
    } else {
      toast.error(res?.message);
    }
  };

  useEffect(() => {
    if (Array.isArray(sectionData) && sectionData.includes(7)) {
      setSectionItem(true);
    } else {
      setSectionItem(false);
    }
  }, [sectionData]);

  return (
    <section style={{ position: "relative", marginTop: "50px" }}>
      <div
        className="remove-btn-sec btn"
        type="button"
        style={{ background: sectionItem ? "red" : "green", zIndex: 9999 }}
        onClick={() => setDeleteUndeleteModal(true)}
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

      <div class="container mt-10">
        <div class="main-title mb-2 text-center mt-10">
          <div>
            <span>Our Journey of Success</span>
          </div>
        </div>
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

                <div
                  className="remove-btn-sec btn"
                  type="button"
                  style={{
                    background: "red",

                    top: "11px",
                    right: "59px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProductData(item.id);
                  }}
                >
                  <FontAwesomeIcon style={{ color: "white" }} icon={faTrash} />
                </div>
                <button
                  class="update-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    editFunction(item);
                  }}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
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
          <div class="col-lg-3" onClick={() => setAddProduct(true)}>
            <button
              class="add-panel"
              type="button"
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
      </div>
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
                  Would you like to publish this section on your live website?
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
                    Would you like to remove this section from your live
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
                    Would you like to publish this section on your live website?
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
                  Add Product
                </h3>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="productName" className="form-label">
                          Certificate Name
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
                        <label htmlFor="productImage" className="form-label">
                          Certificate Image
                        </label>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setEditedHeader((prev) => ({
                                  ...prev,
                                  certificates: event.target.result, // base64 preview
                                  certificatesFile: file, // actual file to upload later
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {editedHeader.certificatesFile && (
                          <img
                            src={
                              editedHeader.certificates
                                ? editedHeader.certificates
                                : baseFileURL + headerData.certificates
                            }
                            alt="Preview"
                            width="120"
                            style={{ marginTop: "10px" }}
                          />
                        )}

                        <small className="form-text text-muted">
                          Only JPG, JPEG, or PNG files can be uploaded (up to 5
                          images). Max size: 2MB. Max width: 1024px, max height:
                          768px.
                        </small>
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
    </section>
  );
};

export default CertificateDraft;
