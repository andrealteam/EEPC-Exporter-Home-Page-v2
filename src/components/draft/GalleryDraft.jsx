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

const GalleryDraft = ({ memberId }) => {
  const fileInputRef = useRef(null);
  const [viewModal, setViewModal] = useState(null);
  const [viewEditModal, setViewEditModal] = useState(null);
  const [addProduct, setAddProduct] = useState(false);
  const [deleteUndoMOdal, setDeleteUndoModal] = useState(false);
  const [idData, setIdData] = useState(null);

  const [deleteUndeleteMOdal, setDeleteUndeleteModal] = useState(false);

  const [openViewEdit, setOpenViewEdit] = useState(false);
  const [sectionItem, setSectionItem] = useState(false);


  const {
    data: productsData,
    isLoading,
    isError,
    error: productsError,
  } = useQuery({
    queryKey: ["gallery-draft"],
    queryFn: () => getGallery(memberId),
  });

  const { data: sectionData, error: sectionError } = useQuery({
    queryKey: ["get-section-in-gallery"],
    queryFn: () => getSection(memberId),
  });


  const [editedBanner, setEditedBanner] = useState({
    id: "",

    image: [], // change from string to array
    imageFile: [],
    gallery: "",
    coverImage: "",
    coverImageFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBanner((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const existingImageFiles = editedBanner?.imageFile || [];
    const existingImagePreviews = editedBanner?.image || [];

    const maxSelectable = 5 - existingImageFiles.length;
    const limitedFiles = newFiles.slice(0, maxSelectable); // Limit total to 5

    const readers = [];
    const newImagePreviews = [];
    const newImageFiles = [];

    limitedFiles.forEach((file) => {
      newImageFiles.push(file);
      const reader = new FileReader();
      readers.push(
        new Promise((resolve) => {
          reader.onload = (event) => {
            newImagePreviews.push(event.target.result);
            resolve();
          };
          reader.readAsDataURL(file);
        })
      );
    });

    Promise.all(readers).then(() => {
      setEditedBanner((prev) => ({
        ...prev,
        image: [...(prev?.image || []), ...newImagePreviews],
        imageFile: [...(prev?.imageFile || []), ...newImageFiles],
      }));
    });

    // Clear input so user can re-select same files if needed
    e.target.value = "";
  };


  const handleRemoveImage = async (index) => {
    const updatedImages = [...(editedBanner.image || [])];
    const updatedFiles = [...(editedBanner.imageFile || [])];

    // Check if the image came from backend (has ID)
    const backendImage = updatedFiles[index];
    const backendImageId = backendImage?.id || null;

    // Remove image from UI state
    updatedImages.splice(index, 1);
    updatedFiles.splice(index, 1);

    setEditedBanner((prev) => ({
      ...prev,
      image: updatedImages,
      imageFile: updatedFiles,
    }));

    // Optional: reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // If image has ID, delete it from backend
    if (backendImageId) {
      try {
        const res = await deleteGalleryImage(backendImageId);
        if (res.status) {
          toast.success(res?.message || "Image deleted from server");
          queryClient.invalidateQueries(["gallery-draft"]);
        }
      } catch (error) {
        toast.error("Failed to delete from backend");
      }
    }
  };

  const queryClient = useQueryClient();
  const handleSave = async () => {
    // You can send editedHeader.logoFile to server if file was changed
    let res = await postGallery(
      editedBanner.id,
      memberId,
      editedBanner.gallery,

      editedBanner.imageFile,
      editedBanner.coverImageFile
    );
    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["gallery-draft"]);
      setAddProduct(false);
      setEditedBanner({
        id: "",
        image: [], // change from string to array
        imageFile: [],
        gallery: "",
        coverImage: "",
        coverImageFile: null,
      });
      setViewEditModal(null);
    } else {
      toast.error(res?.message);
    }
  };

  function editFunction(data) {
    setEditedBanner({
      id: data?.id,

      image: data.image,
      imageFile: [...data.images],
      gallery: data.gallery,
    });
    setViewEditModal(data);
  }

  function closeModal() {
    setEditedBanner({
      id: "",
      image: [], // change from string to array
      imageFile: [],
      gallery: "",
      coverImage: "",
      coverImageFile: null,
    });
    setAddProduct(false);
    setViewEditModal(null);
  }

  const deleteSpecificProduct = async (id) => {
    if (id) {
      let res;
      try {
        res = await deleteGallery(id);
        toast.success(res?.message);
        setDeleteUndoModal(false);
        queryClient.invalidateQueries(["gallery-draft"]);
      } catch (error) {
        toast.error(res?.message);
      }
    }
  };

  const deleteProductData = async (id) => {
    setDeleteUndoModal(true);
    setIdData(id);
  };


  // if (!productsData || productsData.length === 0) {
  //   return (
  //     <div class="col-lg-3" onClick={() => setAddProduct(true)}>
  //       <button
  //         class="add-panel"
  //         type="button"
  //         data-bs-toggle="modal"
  //         data-bs-target="#staticBackdrop"
  //       >
  //         <FontAwesomeIcon icon={faPlus} />
  //       </button>
  //     </div>
  //   );
  // }

  // if (isError)
  //   return <p>Error: {productsError.message || "Something went wrong!"}</p>;

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

  const updateSectionView = async () => {
    let sections = 10;
    let res = await postUpdateSection(memberId, sections);
    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["get-section-in-gallery"]);
      setDeleteUndeleteModal(false);
    } else {
      toast.error(res?.message);
    }
  };

  useEffect(() => {
    if (Array.isArray(sectionData) && sectionData.includes(10)) {
      setSectionItem(true);
    } else {
      setSectionItem(false);
    }
  }, [sectionData]);

  return (
    <>
      <section class="pb-100" style={{ position: "relative" }}>
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

        <div class="container">
          <div class="main-title mb-5 text-center">
            <div>
              <span>Our Gallery</span>
            </div>
          </div>
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
                    <FontAwesomeIcon
                      style={{ color: "white" }}
                      icon={faTrash}
                    />
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
                      {item?.gallery}
                    </a>
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
                        Would you like to publish this section on your live
                        website?
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

            {(productsData?.length < 12 || !productsData) && (
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
            )}
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
                  Add Gallery
                </h3>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="productName" className="form-label">
                          Gallery Name
                        </label>

                        <input
                          type="text"
                          name="gallery"
                          value={editedBanner.gallery}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="productImage" className="form-label">
                          Gallery Cover Image
                        </label>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setEditedBanner((prev) => ({
                                  ...prev,
                                  coverImage: event.target.result, // base64 preview
                                  coverImageFile: file, // actual file to upload later
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {editedBanner.coverImageFile && (
                          <img
                            src={
                              editedBanner.coverImage
                                ? editedBanner.coverImage
                                : baseFileURL + editedBanner.coverImage
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

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="productImage" className="form-label">
                          Gallery Image
                        </label>

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />

                        {editedBanner.imageFile?.length > 0 && (
                          <ul
                            style={{
                              listStyle: "none",
                              paddingLeft: 0,
                              marginTop: "10px",
                            }}
                          >
                            {editedBanner.imageFile?.map((file, index) => (
                              <li
                                key={index}
                                style={{
                                  display: "inline-block",
                                  // alignItems: "center",
                                  marginBottom: "4px",
                                  position: "relative",
                                }}
                              >
                                <span
                                  style={{
                                    marginRight: "8px",
                                    position: "relative",
                                  }}
                                >
                                  {file?.image ? (
                                    <img
                                      src={baseFileURL + file.image}
                                      alt="Preview"
                                      width="120"
                                    />
                                  ) : file instanceof File ? (
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt="Preview"
                                      width="120"
                                    />
                                  ) : null}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // removeImageFRomBackend(file?.id);
                                    handleRemoveImage(index);
                                  }}
                                  className="preview-cancel-button"
                                >
                                  ×
                                </button>
                              </li>
                            ))}
                          </ul>
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
    </>
  );
};

export default GalleryDraft;
