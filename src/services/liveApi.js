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
    const res = await api.post(`exporter-testimonial-submit`, {
      url: website_url,
      name: data.name,
      testimonial: data.testimonial,
      email: data.email,
      designation: data?.designation,
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

// Post Get In Touch message
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

// ====== NEW FUNCTIONS FOR ACTIVITY LOG ======

// Get all Get In Touch messages for a member
export const getGetInTouchMessages = async (member_id) => {
  try {
    const res = await api.get(`get-exporter-get-in-touch-messages/${member_id}`);
    return res.status === 200 ? res.data.data : [];
  } catch (error) {
    console.error("Get Get In Touch Messages:", error);
    return [];
  }
};

// Get all Contact form messages for a member
export const getContactMessages = async (member_id) => {
  try {
    const res = await api.get(`get-exporter-contact-messages/${member_id}`);
    return res.status === 200 ? res.data.data : [];
  } catch (error) {
    console.error("Get Contact Messages:", error);
    return [];
  }
};

// Get all visitor messages (combined Get In Touch + Contact messages) for a member
export const getVisitorMessages = async (member_id) => {
  try {
    const res = await api.get(`get-visitor-messages/${member_id}`);
    return res.status === 200 ? res.data.data : [];
  } catch (error) {
    console.error("Get Visitor Messages:", error);
    return [];
  }
};

// Get visitor activity with messages (combined endpoint if available)
export const getVisitorActivityWithMessages = async (member_id) => {
  try {
    const res = await api.get(`get-visitor-activity-with-messages/${member_id}`);
    return res.status === 200 ? res.data.data : [];
  } catch (error) {
    console.error("Get Visitor Activity with Messages:", error);
    return [];
  }
};

// Get Get In Touch messages by website URL
export const getGetInTouchByUrl = async (website_url) => {
  try {
    const res = await api.get(`get-get-in-touch-by-url/${website_url}`);
    return res.status === 200 ? res.data.data : [];
  } catch (error) {
    console.error("Get Get In Touch by URL:", error);
    return [];
  }
};

// Get Contact messages by website URL
export const getContactMessagesByUrl = async (website_url) => {
  try {
    const res = await api.get(`get-contact-messages-by-url/${website_url}`);
    return res.status === 200 ? res.data.data : [];
  } catch (error) {
    console.error("Get Contact Messages by URL:", error);
    return [];
  }
};

// Get messages by visitor email
export const getMessagesByVisitorEmail = async (email, member_id) => {
  try {
    const res = await api.get(`get-messages-by-visitor-email`, {
      params: {
        email: email,
        member_id: member_id
      }
    });
    return res.status === 200 ? res.data.data : [];
  } catch (error) {
    console.error("Get Messages by Visitor Email:", error);
    return [];
  }
};

// Get all message types for dashboard
export const getAllVisitorMessagesForDashboard = async (member_id) => {
  try {
    const res = await api.get(`get-all-visitor-messages/${member_id}`);
    if (res.status === 200) {
      return {
        getInTouch: res.data.get_in_touch || [],
        contactMessages: res.data.contact_messages || [],
        testimonials: res.data.testimonials || []
      };
    }
    return {
      getInTouch: [],
      contactMessages: [],
      testimonials: []
    };
  } catch (error) {
    console.error("Get All Visitor Messages:", error);
    return {
      getInTouch: [],
      contactMessages: [],
      testimonials: []
    };
  }
};

// ====== HELPER FUNCTIONS ======

// Extract email from messages response
export const extractEmailsFromMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  const emailSet = new Set();
  messages.forEach(msg => {
    if (msg.email) {
      emailSet.add(msg.email.toLowerCase());
    }
  });
  return Array.from(emailSet);
};

// Group messages by email
export const groupMessagesByEmail = (messages) => {
  if (!Array.isArray(messages)) return {};
  
  const grouped = {};
  messages.forEach(msg => {
    const email = msg.email?.toLowerCase();
    if (email) {
      if (!grouped[email]) {
        grouped[email] = [];
      }
      grouped[email].push({
        message: msg.message,
        name: msg.name,
        phone: msg.phone,
        timestamp: msg.created_at || msg.timestamp || msg.date,
        type: msg.type || 'message',
        source: msg.source || 'unknown'
      });
    }
  });
  return grouped;
};

// Filter messages by date range
export const filterMessagesByDateRange = (messages, startDate, endDate) => {
  if (!Array.isArray(messages)) return [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return messages.filter(msg => {
    const msgDate = new Date(msg.created_at || msg.timestamp || msg.date);
    return msgDate >= start && msgDate <= end;
  });
};

// Count total messages by type
export const countMessagesByType = (messages) => {
  if (!Array.isArray(messages)) return {};
  
  const counts = {
    'get-in-touch': 0,
    'contact': 0,
    'testimonial': 0,
    'other': 0
  };
  
  messages.forEach(msg => {
    const type = msg.type || 'other';
    counts[type] = (counts[type] || 0) + 1;
  });
  
  return counts;
};