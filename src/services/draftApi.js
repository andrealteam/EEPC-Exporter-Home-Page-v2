import axios from "axios";
import { api } from "./api";

// Get Header
export const getHeader = async (memberId) => {
  try {
    console.log(`[getHeader] Fetching header for memberId:`, memberId);
    const res = await api.get(`get-exporter-header-section/${memberId}`);
    console.log('[getHeader] Raw API Response:', res);
    
    const data = res?.data;
    console.log('[getHeader] Response data:', data);
    
    // Check if we have a nested data property or if the response is flat
    const result = data?.data || data || {};
    console.log('[getHeader] Processed result:', result);
    
    return result;
  } catch (error) {
    console.error('[getHeader] Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return {};
  }
};

//Get Banner
export const getBanner = async (memberId) => {
  try {
    const res = await api.get(`get-exporter-banner-section/${memberId}`);
    const data = res?.data;
    return data?.data || data || {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Social Media
export const getSocialMediaList = async (memberId) => {
  try {
    const res = await api.get(`exporter-social-media-draft/${memberId}`);
    const data = res?.data;
    return data?.data || data || {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get About
export const getAbout = async (memberId) => {
  try {
    const res = await api.get(`get-exporter-about-section/${memberId}`);
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get WhoWeAre
export const getWhoWeAre = async (memberId) => {
  try {
    const res = await api.get(`get-exporter-who-we-are-section/${memberId}`);
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Products
export const getProducts = async (memberId) => {
  try {
    const res = await api.get(`get-exporter-products/${memberId}`);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get HS Codes with product
export const getHsCodesWithProduct = async (memberId) => {
  try {
    const res = await api.get(`hs-codes-list`);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Footer
export const getFooter = async (memberId) => {
  try {
    const res = await api.get(`get-exporter-footer-section/${memberId}`);
    return res.data?.data || res.data || {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get getCountry
export const getCountry = async () => {
  try {
    const res = await axios.get(`https://info.eepcindia.org/api/country-flag`);
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Section
export const getSection = async (memberId) => {
  try {
    const res = await api.get(`exporter-homepage-sections/${memberId}`);

    if (res.status === 200 && res.data) {
      return res.data.data;
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error fetching section data:", error);
    return {};
  }
};

//Get Section
export const getRejectionSection = async (memberId) => {
  try {
    const res = await api.get(`get-exporter-rejected-section/${memberId.memberId}`);

    if (res.status === 200 && res.data) {
      return res.data.data;
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error fetching section data:", error);
    return {};
  }
};

// Post Header
export const postHeader = async (
  member_id,
  phone,
  email,
  logo,
  facebook,
  twitter,
  instagram,
  linkedin,
  whatsapp
) => {
  const formData = new FormData();

  formData.append("member_id", member_id);
  formData.append("phone", phone);
  formData.append("email", email);
  formData.append("logo", logo);
  formData.append("facebook", facebook);
  formData.append("twitter", twitter);
  formData.append("instagram", instagram);
  formData.append("linkedin", linkedin);
  formData.append("whatsapp", whatsapp);

  try {
    const res = await api.post("update-exporter-header-section", formData);
    if (res.status === 201 && res.status) {
      return res.data;
    } else {
      return res.data;
    }
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

// Post Banner
export const postBanner = async (member_id, banner, brochure, since_text) => {

  const formData = new FormData();

  formData.append("member_id", member_id);
  formData.append("since_text", since_text);

  // banner always string (link)
  if (typeof banner === "string") {
    formData.append("banner", banner);
  }

  // brochure can be File or string
  if (brochure instanceof File) {
    formData.append("brochure", brochure); // file append
  } else if (typeof brochure === "string" && brochure) {
    formData.append("brochure", brochure); // string path append
  }

  try {
    const res = await api.post("update-exporter-banner-section", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });


    return res.data;
  } catch (error) {
    console.error("Post Banner Error:", error);
    return {};
  }
};

// Post AboutSection
export const postWhoWeAreSection = async (
  member_id,
  about_content,
  nature_of_business,
  additional_business,
  company_ceo,
  registered_address,
  total_employees,
  year_of_est,
  firm_status,
  annual_turnover,
  export_destination
) => {
  try {
    const res = await api.post("update-exporter-who-we-are-section", {
      member_id: member_id,
      about_content: about_content,
      nature_of_business: nature_of_business,
      additional_business: additional_business,
      company_ceo: company_ceo,
      registered_address: registered_address,
      total_employees: total_employees,
      year_of_est: year_of_est,
      firm_status: firm_status,
      annual_turnover: annual_turnover,
      export_destination: export_destination,
    });
    return res.data;
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

// Post AboutSection
export const postWhoWeAre = async (
  member_id,
  nature_of_business,
  additional_business,
  company_ceo,
  registered_address,
  total_employees,
  year_of_est,
  firm_status,
  annual_turnover,
  video_link
) => {
  try {
    const res = await api.post("update-exporter-who-we-are-section", {
      member_id: member_id,
      nature_of_business: nature_of_business,
      additional_business: additional_business,
      company_ceo: company_ceo,
      registered_address: registered_address,
      total_employees: total_employees,
      year_of_est: year_of_est,
      firm_status: firm_status,
      annual_turnover: annual_turnover,
      video_link: video_link,
    });
    // If login is successful and we have the token, store it in cookies
    if (res.status === 200 && res.status) {
      // Cookies.set("auth_token", res.data.token, {
      //   expires: 4,
      //   secure: true,
      //   sameSite: "Strict",
      // }); // Store the JWT in a cookie
      // Cookies.set("emp_code", res.data.data.emp_code);
      // Cookies.set("emp_name", res.data.data.emp_name);
      return res.data;
    } else {
      return res.data;
    }
  } catch (error) {
    console.error("update:", error);
    return {};
  }
};

// Post Products
export const postProducts = async (
  member_id,
  id,
  exporter_id,
  category,
  product,
  itc_hs_code,
  end_use_sectors,
  image,
  video,
  certificates,
  export_country,
  details
) => {
  
  const formData = new FormData();

  formData.append("member_id", member_id);
  formData.append("exporter_id", exporter_id);
  formData.append("category", category);
  formData.append("product", product);
  formData.append("itc_hs_code", itc_hs_code);
  formData.append("end_use_sectors", end_use_sectors);
  // Append each file individually
  image?.forEach((file) => {
    formData.append("image[]", file); // or "image" if backend doesn’t expect []
  });

  formData.append("video", video);
  formData.append("certificates", JSON.stringify(certificates));
  formData.append("export_country", export_country);
  formData.append("details", details);

  try {
    let res = null;
    if (id) {
      res = await api.post(`update-exporter-products/${id}`, formData);
    } else {
      res = await api.post("add-exporter-products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return res.data;
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

// Post AboutSection
export const postFooter = async (
  member_id,
  facebook,
  twitter,
  instagram,
  linkedin
) => {
  try {
    const formData = new FormData();

    formData.append("member_id", member_id);
    formData.append("facebook", facebook);
    formData.append("twitter", twitter);
    formData.append("instagram", instagram);
    formData.append("linkedin", linkedin);
    const res = await api.post("update-exporter-footer-section", formData);
    // If login is successful and we have the token, store it in cookies
    if (res.status === 200 && res.status) {
      // Cookies.set("auth_token", res.data.token, {
      //   expires: 4,
      //   secure: true,
      //   sameSite: "Strict",
      // }); // Store the JWT in a cookie
      // Cookies.set("emp_code", res.data.data.emp_code);
      // Cookies.set("emp_name", res.data.data.emp_name);
      return res.data;
    } else {
      return res.data;
    }
  } catch (error) {
    console.error("update:", error);
    return {};
  }
};

// Delete Specific Product Image
export const deleteImage = async (id) => {

  try {
    const res = await api.delete(`delete-exporter-product-image/${id}`);

    return res.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: true, message: error.message };
  }
};

// Post AboutSection
export const postUpdateSection = async (member_id, sections) => {
  try {
    const res = await api.post("selected-exporter-homepage-sections", {
      member_id: member_id,
      sections: sections,
    });

    if (res.status === 200 && res.status) {
      return res.data;
    } else {
      return res.data;
    }
  } catch (error) {
    console.error("update:", error);
    return {};
  }
};

// Delete Specific Product
export const deleteProduct = async (id) => {

  try {
    const res = await api.delete(`delete-exporter-products/${id}`);

    return res.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: true, message: error.message };
  }
};

//post Certifucates
export const postCertificates = async (member_id, name, certificates) => {
  const formData = new FormData();

  formData.append("member_id", member_id);
  formData.append("certificates", certificates);
  formData.append("name", name);

  try {
    const res = await api.post("add-exporter-certificates", formData);
    if (res.status === 201 && res.status) {
      return res.data;
    } else {
      return res.data;
    }
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Certifucates
export const getCertificates = async (memberId) => {
  try {
    const res = await api.get(`get-exporter-certificates/${memberId}`);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Address
export const getAddress = async (memberId) => {
  try {
    const res = await api.get(`get-exporter-homepage/${memberId}`);
    return res.data?.data || res.data || {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

// Update certificates
export const updateCertificates = async (id, member_id, name, certificates) => {
  // console.log("sab checck", member_id, about_title, about_content, about_image);
  const formData = new FormData();

  formData.append("member_id", member_id);
  formData.append("name", name);
  formData.append("certificates", certificates);

  try {
    const res = await api.post(`update-exporter-certificates/${id}`, formData);
    // console.log("Image delete response:", res.data);

    return res.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: true, message: error.message };
  }
};

//DELETE certificates
export const deleteCertificates = async (id) => {
  try {
    const res = await api.delete(`delete-exporter-certificates/${id}`);

    return res.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: true, message: error.message };
  }
};

//Get Testimonials
export const getTestimonials = async (memberId) => {
  try {
    const res = await api.get(
      `get-exporter-testimonial-by-member-live/${memberId}`
    );
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//post Testimonials
export const postTestimonials = async (
  member_id,
  name,
  company,
  designation,
  message
) => {
  try {
    const res = await api.post("add-exporter-testimonials", {
      member_id: member_id,
      name: name,
      company: company,
      designation: designation,
      message: message,
    });

    if (res.status === 200 && res.status) {
      return res.data;
    } else {
      return res.data;
    }
  } catch (error) {
    console.error("update:", error);
    return {};
  }
};

//post SocialMedia
export const postSocialMedia = async (member_id, links) => {
  try {
    const res = await api.post("add-exporter-social-media", {
      member_id: member_id,
      social_media: links,
    });

    if (res.status === 200 && res.status) {
      return res.data;
    } else {
      return res.data;
    }
  } catch (error) {
    console.error("update:", error);
    return {};
  }
};

// Update Testimonials
export const updateTestimonials = async (
  id,
  name,
  company,
  designation,
  message
) => {
  try {
    const res = await api.post(`update-exporter-testimonials/${id}`, {
      name: name,
      company: company,
      designation: designation,
      message: message,
    });
    // console.log("Image delete response:", res.data);

    return res.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: true, message: error.message };
  }
};

//DELETE Testimonials
export const deleteTestimonials = async (id) => {
  try {
    const res = await api.delete(`delete-exporter-testimonials/${id}`);

    return res.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: true, message: error.message };
  }
};

//post Awards
export const postAwards = async (member_id, name, certificates) => {
  const formData = new FormData();

  formData.append("member_id", member_id);
  formData.append("awards", certificates);
  formData.append("name", name);

  try {
    const res = await api.post("add-exporter-awards", formData);
    if (res.status === 201 && res.status) {
      return res.data;
    } else {
      return res.data;
    }
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Awards
export const getAwards = async (memberId) => {
  try {
    const res = await api.get(`get-exporter-awards/${memberId}`);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

// Update Awards
export const updateAwards = async (id, member_id, name, certificates) => {
  // console.log("sab checck", member_id, about_title, about_content, about_image);
  const formData = new FormData();

  formData.append("member_id", member_id);
  formData.append("name", name);
  formData.append("awards", certificates);

  try {
    const res = await api.post(`update-exporter-awards/${id}`, formData);
    // console.log("Image delete response:", res.data);

    return res.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: true, message: error.message };
  }
};

//DELETE Awards
export const deleteAwards = async (id) => {
  try {
    const res = await api.delete(`delete-exporter-awards/${id}`);

    return res.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: true, message: error.message };
  }
};

//Get Gallery
export const getGallery = async (memberId) => {
  try {
    const res = await api.get(`get-exporter-gallery/${memberId}`);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

// Post Gallery
export const postGallery = async (
  id,
  member_id,
  gallery,
  image,
  cover_image
) => {
  const formData = new FormData();

  formData.append("member_id", member_id);

  // Append each file individually
  image?.forEach((file) => {
    formData.append("image[]", file); // or "image" if backend doesn’t expect []
  });

  formData.append("gallery", gallery);
  formData.append("cover_image", cover_image);

  try {
    let res = null;
    if (id) {
      res = await api.post(`update-exporter-gallery/${id}`, formData);
    } else {
      res = await api.post("add-exporter-gallery", formData);
    }
    return res.data;
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

// Delete Specific Gallery
export const deleteGallery = async (id) => {

  try {
    const res = await api.delete(`delete-exporter-gallery/${id}`);

    return res.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: true, message: error.message };
  }
};

// Delete Specific Gallery Image
export const deleteGalleryImage = async (id) => {

  try {
    const res = await api.delete(`delete-exporter-gallery-image/${id}`);

    return res.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: true, message: error.message };
  }
};
