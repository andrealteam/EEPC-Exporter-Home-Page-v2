import axios from "axios";
import { api } from "./api";

// Post LiveWebsite
export const postLiveWebsite = async (token, member_id) => {
  try {
    const res = await api.post("submit-exporter-homepage", {
      member_id: member_id,
      publish: "publish",
      token: token, 
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

export const postEditExporterHomePage = async (member_id) => {
  try {
    const res = await api.post("exporter-homepage-edit-status-change", {
      member_id: member_id,
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

//add/remove favorite
export const postAddToFavorite = async ({
  website_url,
  email,
  name,
  phone,
}) => {
  try {
    const res = await api.post("add-to-favorite", {
      url: website_url,
      email,
      name,
      phone,
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

//get favorite
export const getFavorite = async ({ website_url, email, name, phone }) => {
  try {
    const res = await api.get("favorite-website-check", {
      params: {
        url: website_url,
        email,
        name,
        phone,
      },
    });

    if (res.status === 200) {
      return res.data;
    } else {
      return res.data || {};
    }
  } catch (error) {
    console.error("getFavorite error:", error);
    return {};
  }
};

// Get LiveHeader
export const getLiveHeader = async (website_url) => {
  try {
    const res = await api.get(
      `get-exporter-header-section-publish/${website_url}`
    );
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Banner
export const getLiveBanner = async (website_url) => {
  try {
    const res = await api.get(
      `get-exporter-banner-section-publish/${website_url}`
    );
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Address
export const getLiveAddress = async (website_url) => {
  try {
    const res = await api.get(`get-exporter-homepage-publish/${website_url}`);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get About
export const getLiveAbout = async (website_url) => {
  try {
    const res = await api.get(
      `get-exporter-about-section-publish/${website_url}`
    );
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get WhoWeAre
export const getLiveWhoWeAre = async (website_url) => {
  try {
    const res = await api.get(
      `get-exporter-who-we-are-section-publish/${website_url}`
    );
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Products
export const getLiveProducts = async (website_url) => {
  try {
    const res = await api.get(`get-exporter-products-publish/${website_url}`);
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Social Media
export const getLiveSocialMediaList = async (website_url) => {
  try {
    const res = await api.get(
      `get-exporter-social-media-publish/${website_url}`
    );
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//Get Footer
export const getLiveFooter = async (website_url) => {
  try {
    const res = await api.get(
      `get-exporter-footer-section-publish/${website_url}`
    );
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

export const getLiveSection = async (website_url) => {
  try {
    const res = await api.get(
      `exporter-homepage-sections-publish/${website_url}`
    );

    if (res.status === 200 && res.data) {
      return res.data;
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error fetching section data:", error);
    return {};
  }
};

//get certificate
export const getLiveCertificate = async (website_url) => {
  try {
    const res = await api.get(
      `get-exporter-certificates-publish/${website_url}`
    );
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//get Awards
export const getLiveAwards = async (website_url) => {
  try {
    const res = await api.get(`get-exporter-awards-publish/${website_url}`);
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//get Testimonials
export const getLiveTestimonials = async (website_url) => {
  try {
    const res = await api.get(
      `get-exporter-testimonials-publish/${website_url}`
    );
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//get Gallery
export const getLiveGallery = async (website_url) => {
  try {
    const res = await api.get(`get-exporter-gallery-publish/${website_url}`);
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

//get Participation
export const getLiveParticipation = async (website_url) => {
  try {
    const res = await api.get(`get-exporter-products-publish/${website_url}`);
    // console.log(res.data);
    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};

// Post Message
export const postMessages = async (data, website_url) => {
  try {
    const res = await api.post(`exporter-messages-post/${website_url}`, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
      from_user: data.from_user,
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

// Post Review in testimonial
export const postReview = async (data, website_url) => {
  try {
    // Get the current member ID from cookie if available
    const currentMemberId = document.cookie
      .split('; ')
      .find(row => row.startsWith('eepc_member='))
      ?.split('=')[1];

    const postData = {
      url: website_url,
      name: data.name,
      testimonial: data.testimonial,
      email: data.email,
      phone: data.phone,
      designation: data?.designation,
      reviewer_member_id: currentMemberId || null
    };
    
    const res = await api.post(`exporter-testimonial-submit`, postData);

    if (res.status === 201 && res.status) {
      return res.data;
    } else {
      return res.data;
    }
  } catch (error) {
    console.error("update:", error);
    return {};
  }
};

// Post Review in testimonial
export const postGetInTouch = async (data, website_url) => {
  try {
    const res = await api.post(`exporter-get-in-touch-submit`, {
      url: website_url,
      name: data.name,
      email: data.email,
      message: data.message,
    });

    if (res.status === 201 && res.status) {
      return res.data;
    } else {
      return res.data;
    }
  } catch (error) {
    console.error("update:", error);
    return {};
  }
};

//get Messages
export const getMessages = async (email, website_url) => {
  try {
    const res = await api.post(`get-messages-based-on-email/${website_url}`, {
      email: email,
    });

    return res.status === 200 ? res.data.data : {};
  } catch (error) {
    console.error("Get Header:", error);
    return {};
  }
};
