import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { demoLogo } from "../../utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DOMPurify from "dompurify";

import {
  getBanner,
  getHeader,
  getSection,
  getSocialMediaList,
  postBanner,
  postSocialMedia,
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
import { useChangeTracker } from "../../contexts/ChangeTrackerContext";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faWhatsapp,
  faXTwitter, // X / Twitter
  faYoutube,
  faTiktok,
  faSnapchat,
  faPinterest,
  faReddit,
  faTelegram,
} from "@fortawesome/free-brands-svg-icons";
import ReactQuill from "react-quill";
import Loader from "../Loader";

const iconMap = {
  facebook: faFacebook,
  instagram: faInstagram,
  linkedin: faLinkedin,
  twitter: faXTwitter,
  youtube: faYoutube,
  tiktok: faTiktok,
  snapchat: faSnapchat,
  pinterest: faPinterest,
  reddit: faReddit,
  telegram: faTelegram,
};

// Colors for each platform (optional)
const colorMap = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  twitter: "#000000",
  youtube: "#FF0000",
  tiktok: "#000000",
  snapchat: "#FFFC00",
  pinterest: "#E60023",
  reddit: "#FF4500",
  telegram: "#0088cc",
};

const BannerDraft = ({ memberId }) => {
  const { markAsChanged, updateSectionStatus } = useChangeTracker();
  const [openViewEdit, setOpenViewEdit] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const [sectionItem, setSectionItem] = useState(false);
  const [deleteUndoMOdal, setDeleteUndoModal] = useState(false);
  const [platform, setPlatform] = useState("facebook");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState([
    { id: "facebook", platform: "facebook", url: "" },
    { id: "instagram", platform: "instagram", url: "" },
    { id: "linkedin", platform: "linkedin", url: "" },
    { id: "twitter", platform: "twitter", url: "" },
    { id: "youtube", platform: "youtube", url: "" },
    { id: "tiktok", platform: "tiktok", url: "" },
    { id: "snapchat", platform: "snapchat", url: "" },
    { id: "pinterest", platform: "pinterest", url: "" },
    { id: "reddit", platform: "reddit", url: "" },
    { id: "telegram", platform: "telegram", url: "" },
  ]);
  const queryClient = useQueryClient();
  const [editedBanner, setEditedBanner] = useState({
    banner: "",
    brochure: "",
    bannerFile: null,
    since_text: "",
  });

  const {
    data: bannerData = {},
    isLoading,
    isError,
    error: bannerError,
  } = useQuery({
    queryKey: ["banner-draft", memberId],
    queryFn: () => getBanner(memberId),
    enabled: !!memberId, // wait for memberId before fetching
    placeholderData: {},
  });

  const { data: socialMediaList = {}, isLoading: isLoadingSocialMedia } = useQuery({
    queryKey: ["social-media-list", memberId],
    queryFn: () => getSocialMediaList(memberId),
    enabled: !!memberId,
    placeholderData: {},
  });

  const socialMediaListDemo = [
    {
      id: "3",
      member_id: "31011",
      social_media_id: "0",
      social_media: "facebook",
      url: "https://www.facebook.com/",
      si_no: "1",
      status: "1",
      created_at: "2025-09-13 08:06:29",
      updated_at: "2025-09-13 12:23:53",
    },
    {
      id: "4",
      member_id: "31011",
      social_media_id: "0",
      social_media: "instagram",
      url: "https://www.instagram.com/",
      si_no: "3",
      status: "1",
      created_at: "2025-09-13 08:06:29",
      updated_at: "2025-09-13 12:23:53",
    },
    {
      id: "7",
      member_id: "31011",
      social_media_id: "0",
      social_media: "linkedin",
      url: "https://www.linkedin.com/",
      si_no: "4",
      status: "1",
      created_at: "2025-09-13 08:54:49",
      updated_at: "2025-09-13 12:23:53",
    },
    {
      id: "8",
      member_id: "31011",
      social_media_id: "0",
      social_media: "youtube",
      url: "https://www.youtube.com/",
      si_no: "5",
      status: "1",
      created_at: "2025-09-13 08:54:49",
      updated_at: "2025-09-13 12:23:53",
    },
    {
      id: "10",
      member_id: "31011",
      social_media_id: "0",
      social_media: "tiktok",
      url: "tiktok",
      si_no: "6",
      status: "1",
      created_at: "2025-09-13 09:51:48",
      updated_at: "2025-09-13 12:23:53",
    },
  ];
  let socialMediaListData =
    socialMediaList?.length > 0 ? socialMediaList : socialMediaListDemo;

  // console.log("social media list", socialMediaList);
  // console.log("social bannerData list", bannerData);

  const { data: sectionData, error: sectionError } = useQuery({
    queryKey: ["get-section-in-banner"],
    queryFn: () => getSection(memberId),
  });

  useEffect(() => {
    if (Array.isArray(sectionData) && sectionData.includes(2)) {
      setSectionItem(true);
    } else {
      setSectionItem(false);
    }
  }, [sectionData]);

  useEffect(() => {
    if (!bannerData) return;

    setEditedBanner((prev) => ({
      banner: bannerData.banner || "",
      // Keep existing value IF user changed it (File or null)
      brochure:
        prev.brochure !== undefined && prev.brochure !== ""
          ? prev.brochure
          : bannerData.brochure || "",
      bannerFile: null,
      since_text:
        bannerData.since_text ||
        "Since 1974 - Exporter & Manufacturer of Industrial Valves and Hydraulic Solutions.",
    }));
    
    // Update section completion status
    const isBannerComplete = Boolean(bannerData.banner);
    updateSectionStatus('banner', isBannerComplete);
  }, [bannerData, openViewEdit, updateSectionStatus]);

  // 🔹 Convert API data -> local links state
  useEffect(() => {
    if (socialMediaList && Array.isArray(socialMediaList)) {
      // when building initial links
      const initialLinks = Object.keys(iconMap)?.map((key) => {
        const match = socialMediaList?.find(
          (item) => item.social_media === key
        );
        return {
          id: key, // 👈 fixed unique id (always same for that platform)
          platform: key,
          url: match ? match.url : "",
        };
      });
      setLinks(initialLinks);
    }
  }, [socialMediaList]);

  const handleCancel = () => {
    setOpenViewEdit(false);
  };

  const handleSave = async () => {
    // console.log("Saving header:", editedHeader);
    // You can send editedHeader.logoFile to server if file was changed

    setLoading(true);

    let finalSocialMediaData = links
      .filter((link) => link.url && link.url.trim() !== "")
      .map(({ platform, url }) => ({ platform, url }));

    let postSocialMediaRes = await postSocialMedia(
      memberId,
      finalSocialMediaData
    );

    let res = await postBanner(
      memberId,
      editedBanner.banner,
      editedBanner.brochure,
      editedBanner.since_text
    );
    if (res.status && postSocialMediaRes.status) {
      setLoading(false);
      toast.success(res?.message);
      queryClient.invalidateQueries(["banner-draft"]);
      setOpenViewEdit(false);
    } else {
      setLoading(false);
      toast.error(res?.message || postSocialMediaRes?.message);
    }
  };

  const updateSectionView = async () => {
    let sections = 2;
    let res = await postUpdateSection(memberId, sections);
    if (res.status) {
      toast.success(res?.message);
      queryClient.invalidateQueries(["get-section-in-banner"]);
      setDeleteUndoModal(false);
    } else {
      toast.error(res?.message);
    }
  };

  // 🔹 Add new link manually
  const handleAdd = () => {
    if (!url.trim()) return;
    setLinks((prev) => {
      const updated = prev?.map((link) =>
        link.platform === platform ? { ...link, url } : link
      );
      return updated;
    });
    setUrl("");
  };
  // 🔹 Drag End Handler
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // sirf added (visible) links ko uthao
    const visibleLinks = links.filter(
      (link) => link.url && link.url.trim() !== ""
    );

    // order badlo
    const reordered = Array.from(visibleLinks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    // ab naye order ko puri links me reflect karo
    const newLinks = links
      .filter((link) => !(link.url && link.url.trim() !== "")) // empty wale pehle lelo
      .concat(reordered); // reordered added links ko append karo

    setLinks(newLinks);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBanner((prev) => ({ ...prev, [name]: value }));
    setPlayVideo(false);
    markAsChanged();
  };

  // function to extract YouTube video ID
  const getYouTubeId = (url) => {
    try {
      const regExp =
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    } catch {
      return null;
    }
  };

  const videoId = getYouTubeId(editedBanner?.banner);
  const isYouTube = !!videoId;

  console.log("links data", editedBanner?.banner, bannerData?.banner);

  if (isError)
    return <p>Error: {bannerError.message || "Something went wrong!"}</p>;
  if (isLoading)
    return (
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <Skeleton height={300} />
      </div>
    );

  return (
    <>
      {loading && <Loader isLoading={loading} />}
      {openViewEdit ? (
        <section class="position-relative">
          <div className="update-btn" style={{ zIndex: 9999 }}>
            <button className="edit-btn-2 btn-primary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="edit-btn-1 btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>

          <div className="company-card">
            <div className="company-card-left">
              <div
                className="company-card-image"
                style={{ position: "relative" }}
              >
                {/* Default image OR YouTube */}
                {!isYouTube ? (
                  <img
                    src={
                      editedBanner?.banner
                        ? baseFileURL + editedBanner?.banner
                        : baseFileURL + "uploads/1757759075.jpg"
                    }
                    alt="Preview"
                    width="200"
                    // style={{ marginTop: "10px" }}
                  />
                ) : playVideo ? (
                  <iframe
                    // width="200"
                    // height="150"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube Video"
                    style={{ marginTop: "10px" }}
                  ></iframe>
                ) : (
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt="YouTube Thumbnail"
                      width="200"
                      // style={{ marginTop: "10px" }}
                    />
                    <div
                      className="play-button"
                      onClick={() => setPlayVideo(true)}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "30px",
                        cursor: "pointer",
                        color: "white",
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        padding: "5px 10px",
                      }}
                    >
                      ▶
                    </div>
                  </div>
                )}

                {/* Input field for YouTube link */}
                <input
                  type="text"
                  name="banner"
                  // value={editedBanner.banner}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Paste your Company Profile’s YouTube video link, if any"
                  style={{ marginTop: "10px" }}
                />
              </div>
            </div>

            <div
              className="d-flex flex-column justify-content-between"
              style={{ flex: "2" }}
            >
              <div className="d-flex flex-column gap-2 mt-4">
                <h2 className="company-name">{bannerData?.name}</h2>
                <p className="company-meta">
                  IEC No: <span>{bannerData?.eic_no}</span> | Member Code:{" "}
                  <span>M{bannerData?.member_id}</span>
                </p>
                <p className="company-description">
                  {/* <strong>Since 1974</strong> - Exporter & Manufacturer of
                  Industrial Valves and Hydraulic Solutions. */}
                  <ReactQuill
                    value={editedBanner.since_text}
                    onChange={(value) => {
                      setEditedBanner((prev) => ({
                        ...prev,
                        since_text: value,
                      }));
                      markAsChanged();
                    }}
                  />
                </p>
              </div>

              <div className="smm-container">
                {/* Input Section */}
                <div className="smm-input-row">
                  <select
                    className="smm-select"
                    value={platform}
                    onChange={(e) => {
                      setPlatform(e.target.value);
                      const existing = links.find(
                        (l) => l.platform === e.target.value
                      );
                      setUrl(existing ? existing.url : "");
                    }}
                  >
                    {Object.keys(iconMap)?.map((key) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder={`Enter ${platform} link`}
                    className="smm-input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />

                  <button onClick={handleAdd} className="smm-add-btn">
                    Add / Update
                  </button>
                </div>

                {/* Show Only Added Platforms */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="links">
                    {(provided) => (
                      <div
                        className="smm-list"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {links
                          .filter((link) => link.url && link.url.trim() !== "")
                          ?.map((link, index) => {
                            return (
                              <Draggable
                                key={link.id}
                                draggableId={link.id.toString()} // 👈 must be string
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    className="smm-item"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <FontAwesomeIcon
                                      icon={iconMap[link.platform]}
                                      className={`smm-icon ${link.platform}`}
                                    />
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="smm-link"
                                    >
                                      {link.url}
                                    </a>

                                    {/* ❌ Remove Button */}
                                    <button
                                      className="smm-remove-btn"
                                      onClick={() =>
                                        setLinks((prev) =>
                                          prev?.map((item) =>
                                            item.platform === link.platform
                                              ? { ...item, url: "" }
                                              : item
                                          )
                                        )
                                      }
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              <div className="action-buttons">
                <a
                  href={
                    editedBanner.brochure instanceof File
                      ? URL.createObjectURL(editedBanner.brochure)
                      : baseFileURL +
                        (editedBanner.brochure || bannerData?.brochure)
                  }
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tj-primary-btn header_btn mt-3"
                  style={{ backgroundColor: "#f2f2f2" }}
                >
                  <div className="btn_inner">
                    <div className="btn_icon">
                      <FontAwesomeIcon icon={faArrowDown} />
                    </div>
                    <div className="btn_text">
                      <span>Download Brochure</span>
                    </div>
                  </div>
                </a>

                <button className="btn secondary">E-Catalogue</button>
                {/* <button className="btn favorite">★ Add to favorite</button> */}
              </div>
              <div className="pdf-upload-wrapper">
                {/* Custom styled file input */}
                <div className="relative">
                  <label className="file-input-label">
                    Choose File
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setEditedBanner((prev) => ({
                            ...prev,
                            brochure: file,
                          }));
                          markAsChanged();
                        }
                      }}
                    />
                  </label>
                  <div className="file-name-display">
                    {editedBanner?.brochure?.name || 'No file chosen'}
                  </div>
                </div>
                <style jsx>{`
                  .file-input-label {
                    display: inline-block;
                    padding: 8px 16px;
                    background-color: #f0f0f0;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    margin-right: 10px;
                  }
                  .file-input-label:hover {
                    background-color: #e0e0e0;
                  }
                  .file-name-display {
                    display: inline-block;
                    margin-top: 5px;
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-weight: bold;
                    min-width: 200px;
                    min-height: 36px;
                    line-height: 24px;
                    background-color: #f8f9fa;
                  }
                `}</style>

                {/* Preview */}
                {editedBanner?.brochure && (
                  <div className="pdf-preview-box flex items-center gap-3 mt-2 p-2 border rounded-md bg-gray-100">
                    <span className="text-red-600 text-xl">📄</span>

                    <div className="flex flex-col">
                      {/* File name or URL filename */}
                      <p className="font-medium">
                        {editedBanner.brochure instanceof File
                          ? editedBanner.brochure.name
                          : editedBanner.brochure.split("/").pop()}
                      </p>

                      {/* PDF preview link safely */}
                      <a
                        href={
                          editedBanner.brochure instanceof File
                            ? URL.createObjectURL(editedBanner.brochure)
                            : baseFileURL + editedBanner.brochure
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        View PDF
                      </a>
                    </div>

                    {/* Remove button */}
                    {/* <button
                      className="ml-auto text-red-500 hover:text-red-700 text-lg"
                      onClick={() => {
                        setEditedBanner((prev) => ({
                          ...prev,
                          brochure: null,
                        }));
                      }}
                    >
                      ✖
                    </button> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section class="position-relative banner-section">
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
            style={{ background: sectionItem ? "red" : "green", zIndex: 9999 }}
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

          <div className="company-card">
            <div className="company-card-left">
              <div
                className="company-card-image"
                style={{
                  position: "relative",
                  height: "265px",
                  width: "auto",
                }}
              >
                {/* Default image OR YouTube */}
                {!isYouTube ? (
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      height: "265px",
                    }}
                  >
                    <img
                      src={
                        editedBanner?.banner
                          ? baseFileURL + editedBanner?.banner
                          : baseFileURL + bannerData?.banner
                      }
                      alt="Preview"
                      width="200"
                      height="265"
                      style={{ height: "265px" }}
                    />
                    {/* <div
                      className="play-button"
                      onClick={() => setPlayVideo(true)}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "30px",
                        cursor: "pointer",
                        color: "white",
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        padding: "5px 10px",
                      }}
                    >
                      ▶
                    </div> */}
                  </div>
                ) : playVideo ? (
                  <iframe
                    width="400"
                    height="250"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube Video"
                    // style={{ marginTop: "10px" }}
                  ></iframe>
                ) : (
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      height: "265px",
                    }}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt="YouTube Thumbnail"
                      width="200"
                      style={{
                        // marginTop: "10px",
                        height: "265px",
                        width: "400px",
                      }}
                    />
                    <div
                      className="play-button"
                      onClick={() => setPlayVideo(true)}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "30px",
                        cursor: "pointer",
                        color: "white",
                        background: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        padding: "5px 10px",
                      }}
                    >
                      ▶
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="d-flex flex-column justify-content-between company-card-right"
              style={{ flex: "2" }}
            >
              <div className="d-flex flex-column gap-2 mt-4">
                <h2 className="company-name">{bannerData?.name}</h2>
                <p className="company-meta">
                  IEC No: <span>{bannerData?.eic_no}</span> | Member Code:{" "}
                  <span>M{bannerData?.member_id}</span>
                </p>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(bannerData.since_text),
                  }}
                />
                {/* <p className="company-description">{bannerData.since_text}</p> */}
              </div>

              <div className=" d-flex gap-3 align-items-center">
                {socialMediaListData?.map((item) => {
                  const icon = iconMap[item.social_media];
                  if (!icon) return null; // agar iconMap me nahi hai to skip

                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-link"
                    >
                      <FontAwesomeIcon
                        icon={icon}
                        style={{
                          fontSize: "30px",
                          color: colorMap[item.social_media] || "#000",
                        }}
                        className="footer-icon"
                      />
                    </a>
                  );
                })}
              </div>
              <div className="action-buttons">
                <a
                  href={
                    bannerData?.brochure && baseFileURL + bannerData?.brochure
                  }
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tj-primary-btn header_btn mt-3"
                  style={{ backgroundColor: "#f2f2f2" }}
                >
                  <div className="btn_inner">
                    <div className="btn_icon">
                      <FontAwesomeIcon icon={faArrowDown} />
                    </div>
                    <div className="btn_text">
                      <span>Download Brochure</span>
                    </div>
                  </div>
                </a>

                {/* <button className="btn secondary">E-Catalogue</button> */}
                {/* <button className="btn favorite">★ Add to favorite</button> */}
                <button class="button mt-3">E-Catalogue</button>
{/* 
                <button class="button mt-3">★ Add to favorite</button> */}

                {/* <button className="btn favorite">Leave a Review</button> */}
                <button
                  class="button mt-3"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <div class="svg-wrapper-1">
                    <div class="svg-wrapper">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                      >
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path
                          fill="currentColor"
                          d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <span>Leave a Review</span>
                </button>
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

export default BannerDraft;
