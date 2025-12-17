import React, { act, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { demoLogo } from "../../utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import Select from "react-select";
import {
  deleteImage,
  deleteProduct,
  getBanner,
  getCountry,
  getHeader,
  getHsCodesWithProduct,
  getProducts,
  getSection,
  postProducts,
  postUpdateSection,
} from "../../services/draftApi";
import Slider from "react-slick";

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
import { getProductPanels } from "../../services/authApi";
import Accordion from "react-bootstrap/Accordion";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "../Loader";
import { isValid, parseISO, isAfter, isBefore } from "date-fns";
import { useChangeTracker } from "../../contexts/ChangeTrackerContext";

const categories = ["Pumps", "Valves", "Category 3"];

const staticProducts = {
  Pumps: [
    {
      id: 1,
      product: "Industrial Gate Valve",
      description: "Efficient shut-off and flow control solutions.",
      image:
        "https://sadhimachinery.com/wp-content/uploads/2021/01/2-LTR-DOUBLE-STATION-WITH-200-POINT-MOOG-CONTROLLER-New.png",
    },
    {
      id: 2,
      product: "Hydraulic Control Valve",
      description: "Precision flow control for industrial hydraulics.",
      image:
        "https://www.mazak.com/adobe/dynamicmedia/deliver/dm-aid--3d8b3af0-a28c-492f-bc4c-e67852654be1/inte-i-200h-s4--title-teaser.png?width=1920&quality=100&preferwebp=true",
    },
  ],
  Valves: [
    {
      id: 2,
      product: "Hydraulic Control Valve",
      description: "Precision flow control for industrial hydraulics.",
      image:
        "https://www.mazak.com/adobe/dynamicmedia/deliver/dm-aid--3d8b3af0-a28c-492f-bc4c-e67852654be1/inte-i-200h-s4--title-teaser.png?width=1920&quality=100&preferwebp=true",
    },
  ],
  Machines: [
    {
      id: 1,
      product: "Industrial Gate Valve",
      description: "Efficient shut-off and flow control solutions.",
      image:
        "https://sadhimachinery.com/wp-content/uploads/2021/01/2-LTR-DOUBLE-STATION-WITH-200-POINT-MOOG-CONTROLLER-New.png",
    },
    {
      id: 2,
      product: "Hydraulic Control Valve",
      description: "Precision flow control for industrial hydraulics.",
      image:
        "https://www.mazak.com/adobe/dynamicmedia/deliver/dm-aid--3d8b3af0-a28c-492f-bc4c-e67852654be1/inte-i-200h-s4--title-teaser.png?width=1920&quality=100&preferwebp=true",
    },
  ],
  Rods: [
    {
      id: 1,
      product: "Industrial Gate Valve",
      description: "Efficient shut-off and flow control solutions.",
      image:
        "https://sadhimachinery.com/wp-content/uploads/2021/01/2-LTR-DOUBLE-STATION-WITH-200-POINT-MOOG-CONTROLLER-New.png",
    },
    {
      id: 2,
      product: "Hydraulic Control Valve",
      description: "Precision flow control for industrial hydraulics.",
      image:
        "https://www.mazak.com/adobe/dynamicmedia/deliver/dm-aid--3d8b3af0-a28c-492f-bc4c-e67852654be1/inte-i-200h-s4--title-teaser.png?width=1920&quality=100&preferwebp=true",
    },
  ],
};

const ProductsDraft = ({ memberId }) => {
  const { markAsChanged, updateSectionStatus } = useChangeTracker();
  const fileInputRef = useRef(null);
  const [viewModal, setViewModal] = useState(null);
  const [viewEditModal, setViewEditModal] = useState(null);
  const [addProduct, setAddProduct] = useState(false);
  const [deleteUndoMOdal, setDeleteUndoModal] = useState(false);
  const [idData, setIdData] = useState(null);
  const [selectedPanels, setSelectedPanels] = useState([]);
  const [customCategory, setCustomCategory] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customProduct, setCustomProduct] = useState("");
  const [isOtherSelectedProduct, setIsOtherSelectedProduct] = useState(false);
  const [certificates, setCertificates] = useState([
    { certification: "", issue_date: "", issuing_agency: "", expiary_date: "" },
    { certification: "", issue_date: "", issuing_agency: "", expiary_date: "" },
    { certification: "", issue_date: "", issuing_agency: "", expiary_date: "" },
    { certification: "", issue_date: "", issuing_agency: "", expiary_date: "" },
    { certification: "", issue_date: "", issuing_agency: "", expiary_date: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // Certificate 1 open by default
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMore, setViewMore] = useState(false);

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const queryClient = useQueryClient();
  const sliderSettingsTabs = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4, // ek time me kitne tabs dikhenge
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Agar data empty h to static products use karo

  const {
    data: productsData,
    isLoading,
    isError,
    error: productsError,
  } = useQuery({
    queryKey: ["products-draft", memberId],
    queryFn: () => getProducts(memberId),
  });
  const displayProducts = productsData || {};

  // Update section completion status when products data changes
  useEffect(() => {
    if (productsData) {
      const hasProducts = Object.values(productsData).some(
        category => Array.isArray(category) && category.length > 0
      );
      updateSectionStatus('products', hasProducts);
    } else {
      updateSectionStatus('products', false);
    }
  }, [productsData, updateSectionStatus]);

  // : staticProducts;

  const productCount =
    (selectedCategory && displayProducts[selectedCategory]?.length) || 0;

  const sliderSettings = {
    dots: productCount > 1,
    infinite: productCount > 1,
    speed: 2000,
    autoplay: productCount > 1,
    autoplaySpeed: 3000,
    slidesToShow: productCount > 1 ? Math.min(productCount, 4) : 1,
    slidesToScroll: 1,
    arrows: productCount > 1,
    centerMode: false, // ✅ prevent stretch
    centerPadding: "0px", // ✅ no side padding
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: productCount > 2 ? 2 : productCount,
        },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const categoryTabs = Object.keys(displayProducts);
  // console.log("categoryTabs", categoryTabs);

  useEffect(() => {
    const firstCategory = categoryTabs[0];
    setActiveCategory(firstCategory);
    setSelectedCategory(firstCategory);
  }, [productsData]);

  const { data: categoryData } = useQuery({
    queryKey: ["category-data"],
    queryFn: async () => {
      const result = await getProductPanels();
      return result || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });

  const { data: hsCodesData } = useQuery({
    queryKey: ["hsCodes-data"],
    queryFn: async () => {
      const result = await getHsCodesWithProduct();
      return result || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });

  const productOptions =
    hsCodesData?.map((panel) => ({
      value: panel?.commodity_desc,
      label: panel?.hs_code,
    })) || [];

  const productWithOthers = [
    ...productOptions,
    { value: "others", label: "Others" },
  ];

  // console.log("hsCodesData", productOptions);

  const panelOptions =
    categoryData?.map((panel) => ({
      value: panel.panel_name,
      label: panel.panel_name,
    })) || [];

  const optionsWithOthers = [
    ...panelOptions,
    { value: "others", label: "Others" },
  ];

  // console.log("categoryData data", categoryData);
  const { data: countryData, error: countryError } = useQuery({
    queryKey: ["country-draft"],
    queryFn: getCountry,
  });

  const [editedBanner, setEditedBanner] = useState({
    id: "",
    exporter_id: "",
    category: "",
    product: "",
    itc_hs_code: "",
    end_use_sectors: "",
    image: [], // change from string to array
    imageFile: [],
    video: "",
    certification: "",
    issue_date: "",
    issuing_agency: "",
    expiary_date: "",
    export_country: [],
    details: "",
  });

  // useEffect(() => {
  //   if (whoWeData) {
  //     setEditedBanner({
  //       nature_of_business: whoWeData.nature_of_business,
  //       additional_business: whoWeData.additional_business,
  //       company_ceo: whoWeData.company_ceo,
  //       registered_address: whoWeData.registered_address,
  //       total_employees: whoWeData.total_employees,
  //       year_of_est: whoWeData.year_of_est,
  //       firm_status: whoWeData.firm_status,
  //       annual_turnover: whoWeData.annual_turnover,
  //       video_link: "",
  //     });
  //   }
  // }, [whoWeData]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBanner((prev) => ({ ...prev, [name]: value }));
    markAsChanged();
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const maxSelectable = 5 - editedBanner.imageFile?.length;
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
        image: [...prev?.image, ...newImagePreviews],
        imageFile: [...prev?.imageFile, ...newImageFiles],
      }));
    });

    // Clear input so user can re-select same files if needed
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...editedBanner.image];
    const updatedFiles = [...editedBanner.imageFile];
    updatedImages.splice(index, 1);
    updatedFiles.splice(index, 1);

    setEditedBanner((prev) => ({
      ...prev,
      image: updatedImages,
      imageFile: updatedFiles,
    }));

    // Optional: clear input in case re-selection is needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImageFRomBackend = async (id) => {
    if (id) {
      setLoading(true);
      try {
        let res = await deleteImage(id);
        setLoading(false);
        toast.success(res?.message);
      } catch (error) {
        setLoading(false);
        toast.error(res?.message);
      }
    }
  };

  const countryOptions = countryData?.map((item) => ({
    value: item.country,
    label: item.country,
  }));

  const handleSave = async () => {
    setLoading(true);
    // You can send editedHeader.logoFile to server if file was changed
    let res = await postProducts(
      memberId,
      editedBanner.id,
      editedBanner.exporter_id,
      editedBanner.category,
      editedBanner.product,
      editedBanner.itc_hs_code,
      editedBanner.end_use_sectors,
      editedBanner.imageFile,
      editedBanner.video,
      certificates,
      editedBanner.export_country,
      editedBanner.details
    );
    if (res.status) {
      setLoading(false);
      toast.success(res?.message);
      queryClient.invalidateQueries(["products-draft"]);
      setAddProduct(false);
      setEditedBanner({
        id: "",
        exporter_id: "",
        category: "",
        product: "",
        itc_hs_code: "",
        end_use_sectors: "",
        image: [], // change from string to array
        imageFile: [],
        video: "",
        export_country: [],
        details: "",
      });
      setCertificates([
        {
          certification: "",
          issue_date: "",
          issuing_agency: "",
          expiary_date: "",
        },
        {
          certification: "",
          issue_date: "",
          issuing_agency: "",
          expiary_date: "",
        },
        {
          certification: "",
          issue_date: "",
          issuing_agency: "",
          expiary_date: "",
        },
        {
          certification: "",
          issue_date: "",
          issuing_agency: "",
          expiary_date: "",
        },
        {
          certification: "",
          issue_date: "",
          issuing_agency: "",
          expiary_date: "",
        },
      ]);
      setViewEditModal(null);
    } else {
      setLoading(false);
      toast.error(res?.message);
    }
  };

  function editFunction(data) {
    setEditedBanner({
      id: data?.id,
      exporter_id: data.exporter_id,
      category: data.category,
      product: data.product,
      itc_hs_code: data.itc_hs_code,
      end_use_sectors: data.end_use_sectors,
      image: data.image,
      imageFile: [...data.images],
      video: data.video,
      certification: data.certification,
      issue_date: data.issue_date,
      issuing_agency: data.issuing_agency,
      expiary_date: data.expiary_date,
      export_country: data.export_country,
      details: data.details,
    });
    // ✅ Map backend certificates → frontend certificates
    const mappedCertificates = (data.certificates || []).map((c) => ({
      certification: c.certificate || "",
      issue_date: c.date_of_issue || "",
      issuing_agency: c.issuing_agency || "",
      expiary_date: c.date_of_expiary || "",
    }));

    // Pad with empty certificates until we have 5 total
    while (mappedCertificates.length < 5) {
      mappedCertificates.push({
        certification: "",
        issue_date: "",
        issuing_agency: "",
        expiary_date: "",
      });
    }

    setCertificates(mappedCertificates);
    setViewEditModal(data);
  }

  function closeModal() {
    setEditedBanner({
      id: "",
      exporter_id: "",
      category: "",
      product: "",
      itc_hs_code: "",
      end_use_sectors: "",
      image: [], // change from string to array
      imageFile: [],
      video: "",
      certification: "",
      issue_date: "",
      issuing_agency: "",
      expiary_date: "",
      export_country: [],
      details: "",
    });
    setCertificates([
      {
        certification: "",
        issue_date: "",
        issuing_agency: "",
        expiary_date: "",
      },
      {
        certification: "",
        issue_date: "",
        issuing_agency: "",
        expiary_date: "",
      },
      {
        certification: "",
        issue_date: "",
        issuing_agency: "",
        expiary_date: "",
      },
      {
        certification: "",
        issue_date: "",
        issuing_agency: "",
        expiary_date: "",
      },
      {
        certification: "",
        issue_date: "",
        issuing_agency: "",
        expiary_date: "",
      },
    ]);
    setAddProduct(false);
    setViewEditModal(null);
  }

  const deleteSpecificProduct = async (id) => {
    if (!id) return;

    setLoading(true);

    try {
      const res = await deleteProduct(id);

      toast.success(res?.message);
      setDeleteUndoModal(false);

      queryClient.setQueryData(["products-draft", memberId], (old) => {
        if (!old) return {};

        const newData = {};

        for (const category in old) {
          newData[category] = old[category].filter((item) => item.id !== id);
        }

        // Remove empty categories
        Object.keys(newData).forEach((cat) => {
          if (newData[cat].length === 0) {
            delete newData[cat];
          }
        });

        return newData;
      });

      // Correct key (include memberId)
      queryClient.invalidateQueries(["products-draft", memberId]);
      //refresh page
      // window.location.reload();
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProductData = async (id) => {
    setDeleteUndoModal(true);
    setIdData(id);
  };

  const isValidDateString = (dateString) => {
    if (!dateString) return false;

    // Must be exactly 10 characters (YYYY-MM-DD)
    if (dateString.length !== 10) return false;

    // Check format using regex
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    // Check if it's a valid date
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // console.log("editedBanner data", editedBanner);

  if (isLoading) {
    return (
      <div className="container">
        <div className=" mb-5 text-center">
          <Skeleton height={50} width={150} />
        </div>
        <div className="mb-4 category-slider">
          <Skeleton height={50} />
        </div>
        <div className="p-2 product-item">
          <Skeleton height={200} />
        </div>
      </div>
    );
  }

  // if (isError) {
  //   return <div>Error loading product preview: {productsError.message}</div>;
  // }

  return (
    <>
      {loading && <Loader isLoading={loading} />}
      <section
        className="pb-100 product-section"
        style={{ position: "relative" }}
      >
        <div className="container">
          <div className="main-title mb-5 text-center">
            <div>
              <span>Our Products</span>
              <h2>
                What We Offer
                <button className="edit-btn">
                  <i className="fa-solid fa-pencil"></i>
                </button>
              </h2>
            </div>
          </div>
          {productsData === undefined && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                // height: "300px",
                textAlign: "center",
                color: "#888",
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                No products found. Click the + icon to add your first product.{" "}
              </p>
            </div>
          )}

          {/* Category Tabs */}
          <div className="mb-4 category-slider">
            <Slider {...sliderSettingsTabs}>
              {categoryTabs.map((category) => (
                <div key={category} className="tab-slide">
                  {" "}
                  {/* wrapper fixes spacing */}
                  <button
                    onClick={() => {
                      setActiveCategory(category);
                      setSelectedCategory(category);
                    }}
                    className={`btn category-tab ${
                      activeCategory === category
                        ? "active-tab"
                        : "inactive-tab"
                    }`}
                  >
                    {category}
                  </button>
                </div>
              ))}
            </Slider>
            <div
              class="col-lg-3"
              onClick={() => setAddProduct(true)}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                marginTop: "20px",
              }}
            >
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

          {/* Slider */}
          {displayProducts !== undefined > 0 &&
          displayProducts[selectedCategory]?.length > 1 ? (
            <Slider
              key={displayProducts[selectedCategory]?.length || 0}
              {...sliderSettings}
            >
              {displayProducts[selectedCategory]?.map((item, index) => (
                <div key={index} className="p-2 product-item">
                  <div
                    className="product-items position-relative text-center"
                    style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="product-img position-relative">
                      <div>
                        <img
                          src={
                            item?.images
                              ? baseFileURL + item.images[0]?.image
                              : item.image
                          }
                          alt={item.product}
                          className="img-fluid"
                        />
                      </div>
                    </div>
                    {productsData !== undefined && (
                      <>
                        {/* delete button */}
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

                        {/* edit button */}
                        <button
                          className="update-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            editFunction(item);
                          }}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                      </>
                    )}

                    {/* product info */}
                    <div className="product-text mt-3">
                      <h5 className="text-truncate">{item.product}</h5>
                      <p className="text-muted" style={{ minHeight: "40px" }}>
                        {item?.details?.slice(0, 30)}...
                      </p>
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="cta"
                          onClick={() => setViewModal(item)}
                        >
                          <span>Read More</span>
                          <svg width="15px" height="10px" viewBox="0 0 13 10">
                            <path d="M1,5 L11,5"></path>
                            <polyline points="8 1 12 5 8 9"></polyline>
                          </svg>
                        </button>

                        <button
                          className="btn btn-outline-primary btn-sm"
                          style={{
                            border: "1.5px solid #0d6efd",
                            borderRadius: "25px",
                            padding: "0px 6px",
                            fontWeight: "400",
                            letterSpacing: "0.5px",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#0d6efd";
                            e.target.style.color = "#fff";
                            e.target.style.boxShadow =
                              "0 4px 12px rgba(13, 110, 253, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = "#0d6efd";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          Enquire Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            // 🔹 Jab ek hi product ho, normal render karo
            displayProducts[selectedCategory]?.map((item, index) => (
              <div
                key={index}
                className="p-2 product-item"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  // backgroundColor: "#fff", // white card
                  // borderRadius: "10px",

                  // boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  className="product-items position-relative text-center"
                  style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="product-img position-relative">
                    <div>
                      <img
                        src={
                          item?.images
                            ? baseFileURL + item.images[0]?.image
                            : item.image
                        }
                        alt={item.product}
                        className="img-fluid"
                      />
                    </div>
                  </div>

                  {/* delete button */}
                  <div
                    className="remove-btn-sec btn"
                    type="button"
                    style={{ background: "red", top: "11px", right: "59px" }}
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

                  {/* edit button */}
                  <button
                    className="update-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      editFunction(item);
                    }}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>

                  {/* product info */}
                  <div className="product-text mt-3">
                    <h5 className="text-truncate">{item.product}</h5>
                    <p className="text-muted" style={{ minHeight: "40px" }}>
                      {item?.details?.slice(0, 30)}...
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        className="cta"
                        onClick={() => setViewModal(item)}
                      >
                        <span>Read More</span>
                        <svg width="15px" height="10px" viewBox="0 0 13 10">
                          <path d="M1,5 L11,5"></path>
                          <polyline points="8 1 12 5 8 9"></polyline>
                        </svg>
                      </button>

                      <button
                        className="btn btn-outline-primary btn-sm"
                        style={{
                          border: "1.5px solid #0d6efd",
                          borderRadius: "25px",
                          padding: "0px 6px",
                          fontWeight: "400",
                          letterSpacing: "0.5px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#0d6efd";
                          e.target.style.color = "#fff";
                          e.target.style.boxShadow =
                            "0 4px 12px rgba(13, 110, 253, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "#0d6efd";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        Enquire Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
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
                  Are you sure you want to delete this product?{" "}
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

      {/* {(productsData?.length < 12 || !productsData) && ( */}

      {/* // )} */}
      {viewModal && (
        <div
          className="modal fade show d-block"
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title" id="exampleModalLabel">
                  Product Modal
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setViewModal(null)} // Assuming you use this to close modal
                ></button>
              </div>

              <div className="modal-body">
                <div className="row">
                  {/* Left Column: Image and Video */}
                  <div className="col-lg-6">
                    <div id="productCarousel" data-bs-ride="carousel">
                      <div class="carousel-inner">
                        {viewModal?.images?.length > 0 && (
                          <Swiper
                            modules={[Autoplay, Navigation]}
                            spaceBetween={10}
                            slidesPerView={1}
                            navigation
                            autoplay={{
                              delay: 3000,
                              disableOnInteraction: false,
                            }}
                            loop={true}
                          >
                            {viewModal.images.map((img, index) => (
                              <SwiperSlide key={index}>
                                <img
                                  src={baseFileURL + img?.image}
                                  alt={`Product Image ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "cover",
                                  }}
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        )}
                      </div>

                      {/* Carousel controls (optional) */}
                    </div>

                    {viewModal?.video && (
                      <p className="mt-3">
                        <strong>Product Video:</strong>{" "}
                        <a
                          href={viewModal.video}
                          className="video-btn"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Product Video
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Right Column: Product Info */}
                  <div className="col-lg-6">
                    <h3 className="mb-3">
                      {viewModal?.product || "Product Name"}
                    </h3>

                    <p>
                      <strong>Category:</strong> {viewModal?.category}
                    </p>
                    <p>
                      <strong>ITC HS Code:</strong> {viewModal?.itc_hs_code}
                    </p>

                    {viewModal?.end_use_sectors && (
                      <p>
                        <strong>End Use Sectors:</strong>{" "}
                        {viewModal.end_use_sectors}
                      </p>
                    )}

                    {viewModal?.certification && (
                      <p>
                        <strong>Certification / Standard:</strong>{" "}
                        {viewModal.certification}
                      </p>
                    )}

                    {viewModal?.issue_date && (
                      <p>
                        <strong>Date of Issue:</strong> {viewModal.issue_date}
                      </p>
                    )}

                    {viewModal?.issuing_agency && (
                      <p>
                        <strong>Issuing Agency:</strong>{" "}
                        {viewModal.issuing_agency}
                      </p>
                    )}

                    {viewModal?.expiary_date && (
                      <p>
                        <strong>Date of Expiry:</strong>{" "}
                        {viewModal.expiary_date}
                      </p>
                    )}

                    {viewModal?.export_country &&
                      (() => {
                        let data = viewModal.export_country;
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
                          typeof viewModal.export_country === "string"
                        ) {
                          countries = viewModal.export_country
                            .replace(/\\/g, "")
                            .replace(/^"+|"+$/g, "")
                            .split(",")
                            .map((c) => c.trim())
                            .filter(Boolean)
                            .join(", ");
                        }

                        return countries ? (
                          <p>
                            <strong>Export Countries:</strong> {countries}
                          </p>
                        ) : null;
                      })()}

                    {viewModal?.certificates?.length > 0 && (
                      <div>
                        <strong>Certificates</strong>
                        <Accordion defaultActiveKey="0">
                          {viewModal.certificates.map((cert, index) => (
                            <Accordion.Item
                              eventKey={index.toString()}
                              key={index}
                            >
                              <Accordion.Header>
                                Certificate {index + 1}: {cert.certificate}
                              </Accordion.Header>
                              <Accordion.Body>
                                <p>
                                  <strong>Certificates Name:</strong>{" "}
                                  {cert.certificate}
                                </p>
                                <p>
                                  <strong>Issuing Agency:</strong>{" "}
                                  {cert.issuing_agency}
                                </p>
                                <p>
                                  <strong>Date of Expiry:</strong>{" "}
                                  {cert.date_of_expiary}
                                </p>
                                <p>
                                  <strong>Date of Issue:</strong>{" "}
                                  {cert.date_of_issue}
                                </p>
                              </Accordion.Body>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                      </div>
                    )}

                    {viewModal?.details && (
                      <div>
                        <strong>Technical Details:</strong>

                        <p
                          style={{
                            whiteSpace: "pre-wrap", // ✅ wrap long unbroken text
                            marginTop: "4px",
                            wordBreak: "break-word", // ✅ ensures long words break instead of overflowing
                          }}
                        >
                          {(() => {
                            const text = viewModal.details.trim();

                            // Prevent errors if text is empty
                            if (!text) return "No technical details provided.";

                            const words = text.split(/\s+/).filter(Boolean);
                            const chars = text.length;

                            if (viewMore) return text;

                            // ✅ Limits
                            const WORD_LIMIT = 40;
                            const CHAR_LIMIT = 200;

                            // Word-based truncation
                            const limitedByWords = words
                              .slice(0, WORD_LIMIT)
                              .join(" ");

                            // Character-based truncation
                            const limitedByChars =
                              chars > CHAR_LIMIT
                                ? text.slice(0, CHAR_LIMIT) + "..."
                                : text;

                            // ✅ Choose whichever truncation is *shorter*
                            const preview =
                              limitedByWords.length < limitedByChars.length
                                ? limitedByWords +
                                  (text.length > limitedByWords.length
                                    ? "..."
                                    : "")
                                : limitedByChars;

                            return preview;
                          })()}
                        </p>

                        {(viewModal.details.length > 200 ||
                          viewModal.details.trim().split(/\s+/).filter(Boolean)
                            .length > 40) && (
                          <button
                            onClick={() => setViewMore(!viewMore)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#007bff",
                              padding: 0,
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                          >
                            {viewMore ? "View Less" : "View More"}
                          </button>
                        )}
                      </div>
                    )}
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
                  {addProduct ? "Add Product" : "Update Product"}
                </h3>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="category" className="form-label">
                          Category <span style={{ color: "red" }}>*</span>
                        </label>
                        <div>
                          <Select
                            options={optionsWithOthers}
                            value={
                              isOtherSelected
                                ? { value: "others", label: "Others" }
                                : panelOptions.find(
                                    (opt) => opt.value === editedBanner.category
                                  ) || null
                            }
                            onChange={(selectedOption) => {
                              if (selectedOption.value === "others") {
                                setIsOtherSelected(true);
                                setEditedBanner((prev) => ({
                                  ...prev,
                                  category: "",
                                })); // reset for custom input
                              } else {
                                setIsOtherSelected(false);
                                setEditedBanner((prev) => ({
                                  ...prev,
                                  category: selectedOption.value,
                                }));
                              }
                            }}
                            placeholder="Search and select Category"
                          />

                          {/* Show input only if Others is selected */}
                          {isOtherSelected && (
                            <input
                              type="text"
                              className="form-control mt-2"
                              placeholder="Enter custom category"
                              value={customCategory}
                              onChange={(e) => {
                                setCustomCategory(e.target.value);
                                setEditedBanner((prev) => ({
                                  ...prev,
                                  category: e.target.value,
                                }));
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="hsCode" className="form-label">
                          ITC HS Code <span style={{ color: "red" }}>*</span>
                        </label>

                        <div>
                          <Select
                            options={productWithOthers}
                            value={
                              isOtherSelectedProduct
                                ? { value: "others", label: "Others" }
                                : productOptions.find(
                                    (opt) =>
                                      opt.label === editedBanner.itc_hs_code
                                  ) || null
                            }
                            onChange={(selectedOption) => {
                              if (selectedOption.value === "others") {
                                setIsOtherSelectedProduct(true);
                                setEditedBanner((prev) => ({
                                  ...prev,
                                  itc_hs_code: "",
                                  product: "",
                                }));
                              } else {
                                setIsOtherSelectedProduct(false);
                                setEditedBanner((prev) => ({
                                  ...prev,
                                  itc_hs_code: selectedOption.label,
                                  product: selectedOption.value,
                                }));
                              }
                            }}
                            placeholder="Search and select Product"
                            filterOption={(option, inputValue) =>
                              option.label
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                            }
                          />

                          {/* Show number input only if "Others" is selected */}
                          {isOtherSelectedProduct && (
                            <input
                              type="number"
                              className="form-control mt-2"
                              placeholder="Enter custom HS Code"
                              value={customProduct}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ""); // only numbers
                                setCustomProduct(val);
                                setEditedBanner((prev) => ({
                                  ...prev,
                                  itc_hs_code: val,
                                }));
                              }}
                            />
                          )}
                        </div>

                        {/* <input
                          type="text"
                          name="itc_hs_code"
                          value={editedBanner.itc_hs_code}
                          onChange={handleInputChange}
                          className="form-control"
                        /> */}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="productName" className="form-label">
                          Product Name <span style={{ color: "red" }}>*</span>
                        </label>

                        {/* If Others selected → show input for product name */}
                        {isOtherSelectedProduct ? (
                          <input
                            type="text"
                            name="product"
                            value={editedBanner.product}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter custom product name"
                          />
                        ) : (
                          <input
                            type="text"
                            name="product"
                            value={editedBanner.product}
                            onChange={handleInputChange}
                            className="form-control"
                            readOnly // auto-filled, disable manual typing
                          />
                        )}
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="endUseSectors" className="form-label">
                          End Use Sectors{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="end_use_sectors"
                          value={editedBanner.end_use_sectors}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="productImage" className="form-label">
                          Product Image <span style={{ color: "red" }}>*</span>
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
                                    removeImageFRomBackend(file?.id);
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
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label htmlFor="productVideo" className="form-label">
                          Product Video (optional)
                        </label>
                        <input
                          type="text"
                          name="video"
                          value={editedBanner.video}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                        <small className="form-text text-muted">
                          Please enter a valid video URL (YouTube, Vimeo, MP4
                          link, etc.).
                        </small>
                      </div>
                    </div>
                    <div className="accordion" id="certificatesAccordion">
                      {certificates.map((certificate, index) => (
                        <div key={index} className="mb-3 border rounded">
                          <div
                            className="p-2 bg-light d-flex justify-content-between align-items-center"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setActiveIndex(activeIndex === index ? -1 : index)
                            }
                          >
                            <strong>
                              Certificate {index + 1}{" "}
                              {index + 1 === 1 && (
                                <span style={{ color: "red" }}>*</span>
                              )}
                            </strong>
                            <span>{activeIndex === index ? "▲" : "▼"}</span>
                          </div>

                          {activeIndex === index && (
                            <div className="p-3">
                              <div className="row">
                                <div className="col-lg-6 mb-3">
                                  <label className="form-label">
                                    Certification/Standard
                                    {index + 1 === 1 && (
                                      <span style={{ color: "red" }}>*</span>
                                    )}
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={certificate.certification}
                                    onChange={(e) => {
                                      const newCertificates = [...certificates];
                                      newCertificates[index].certification =
                                        e.target.value;
                                      setCertificates(newCertificates);
                                    }}
                                  />
                                </div>

                                <div className="col-lg-6 mb-3">
                                  <label className="form-label">
                                    Date of Issue
                                    {index + 1 === 1 && (
                                      <span style={{ color: "red" }}>*</span>
                                    )}
                                  </label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={certificate.issue_date || ""}
                                    onChange={(e) => {
                                      const newCertificates = [...certificates];
                                      newCertificates[index].issue_date =
                                        e.target.value;
                                      setCertificates(newCertificates);
                                    }}
                                    onBlur={(e) => {
                                      const issueDate = e.target.value;
                                      const expiryDate =
                                        certificates[index].expiary_date;

                                      if (
                                        issueDate &&
                                        expiryDate &&
                                        issueDate > expiryDate
                                      ) {
                                        alert(
                                          "Issue Date cannot be later than Expiry Date"
                                        );
                                        // Optional: Clear the invalid date
                                        const newCertificates = [
                                          ...certificates,
                                        ];
                                        newCertificates[index].issue_date = "";
                                        setCertificates(newCertificates);
                                      }
                                    }}
                                  />
                                </div>

                                <div className="col-lg-6 mb-3">
                                  <label className="form-label">
                                    Issuing Agency
                                    {index + 1 === 1 && (
                                      <span style={{ color: "red" }}>*</span>
                                    )}
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={certificate.issuing_agency}
                                    onChange={(e) => {
                                      const newCertificates = [...certificates];
                                      newCertificates[index].issuing_agency =
                                        e.target.value;
                                      setCertificates(newCertificates);
                                    }}
                                  />
                                </div>

                                <div className="col-lg-6 mb-3">
                                  <label className="form-label">
                                    Date of Expiry1
                                    {index + 1 === 1 && (
                                      <span style={{ color: "red" }}>*</span>
                                    )}
                                  </label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={certificate.expiary_date || ""}
                                    onChange={(e) => {
                                      const newCertificates = [...certificates];
                                      newCertificates[index].expiary_date =
                                        e.target.value;
                                      setCertificates(newCertificates);
                                    }}
                                    onBlur={(e) => {
                                      const expiryDate = e.target.value;
                                      const issueDate =
                                        certificates[index].issue_date;

                                      if (
                                        issueDate &&
                                        expiryDate &&
                                        expiryDate < issueDate
                                      ) {
                                        alert(
                                          "Expiry Date cannot be earlier than Issue Date"
                                        );
                                        // Optional: Clear the invalid date
                                        const newCertificates = [
                                          ...certificates,
                                        ];
                                        newCertificates[index].expiary_date =
                                          "";
                                        setCertificates(newCertificates);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="exportCountry" className="form-label">
                      Export Country
                    </label>
                    <Select
                      isMulti
                      closeMenuOnSelect={false}
                      name="export_country"
                      options={countryOptions}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Search and select countries..."
                      onChange={(selectedOptions) => {
                        const selectedCountries = selectedOptions?.map(
                          (opt) => opt.value
                        );
                        setEditedBanner((prev) => ({
                          ...prev,
                          export_country: selectedCountries,
                        }));
                      }}
                      value={countryOptions.filter((opt) =>
                        editedBanner.export_country.includes(opt.value)
                      )}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="technicalDetails" className="form-label">
                      Technical Details
                    </label>
                    <p
                      className="text-muted"
                      style={{ fontSize: "0.9rem", marginBottom: "6px" }}
                    >
                      Please provide a clear description of your product’s
                      technical details. You can enter up to{" "}
                      <strong>120 words</strong> or{" "}
                      <strong>800 characters</strong>.
                    </p>

                    <textarea
                      type="text"
                      name="details"
                      value={editedBanner.details}
                      onChange={(e) => {
                        const value = e.target.value;
                        const words = value.trim().split(/\s+/).filter(Boolean);
                        const charCount = value.length;

                        // ✅ limit both words and characters
                        if (words.length <= 120 && charCount <= 800) {
                          handleInputChange(e);
                        }
                      }}
                      className="form-control"
                      rows="4"
                      placeholder="Enter technical details here..."
                    />

                    <small className="text-muted d-block">
                      {
                        editedBanner.details.trim().split(/\s+/).filter(Boolean)
                          .length
                      }
                      /120 words | {editedBanner.details.length}/800 characters
                    </small>
                  </div>

                  {/* Save button */}

                  <div
                    className={`btn btn-secondary ${
                      !editedBanner.category ||
                      !editedBanner.itc_hs_code ||
                      !editedBanner.product ||
                      !editedBanner.end_use_sectors ||
                      !editedBanner.imageFile.length > 0 ||
                      !certificates[0].certification ||
                      !certificates[0].expiary_date ||
                      !certificates[0].issue_date ||
                      !certificates[0].issuing_agency
                        ? "disabled"
                        : ""
                    }`}
                    onClick={handleSave}
                    style={{
                      pointerEvents:
                        !editedBanner.category ||
                        !editedBanner.itc_hs_code ||
                        !editedBanner.product ||
                        !editedBanner.end_use_sectors ||
                        !editedBanner.imageFile.length > 0 ||
                        !certificates[0].certification ||
                        !certificates[0].expiary_date ||
                        !certificates[0].issue_date ||
                        !certificates[0].issuing_agency
                          ? "none"
                          : "auto",
                    }}
                  >
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
    </>
  );
};

export default ProductsDraft;
