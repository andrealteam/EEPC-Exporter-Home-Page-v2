import axios from "axios";
import { api } from "./api";
export const memberBaseUrl = "https://members.eepcindia.com/";
export const memberLogin = "oauth/validate_user";

export const loginMember = async (mem_id, password) => {
  const url = memberBaseUrl + memberLogin;
  const formData = new FormData();

  formData.append("mem_id", mem_id);
  formData.append("user_password", password);

  try {
    const res = await axios.post(url, formData);
    if (res.status === 200 && res.data.is_valid) {
      // Cookies.set("member_id", mem_id);
      // Cookies.set("member_name", res.data.member_name);
      // console.log(res.data)
      return res.data;
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    console.error("login member:", error);
    return { is_valid: false, message: "Login failed" };
  }
};

// Verify
export const verifyExporter = async (data) => {
  try {
    const res = await api.post("login-exporter-homepage", {
      member_id: data.memberId,
    });
    // console.log(res.data);
    return res.status === 200 ? res.data : {};
  } catch (error) {
    console.error("Verify:", error);
    return [];
  }
};

// Register
export const registerExporter = async (data, gstNumber) => {
  try {
    const res = await api.post("register-exporter-homepage", {
      member_id: data.memberId,
      eic_no: data.eicNo,
      gst_no: gstNumber, // make sure this variable is set
      dun_no: data.dunNo,
      product_panel: data.panels, 
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
    });
    return res.data.status === true ? res.data : res.data;
  } catch (error) {
    console.error("Registration:", error);
    return [];
  }
};

// Get Sections
export const getSections = async () => {
  try {
    const res = await api.get("exporter-homepage-sections");
    // console.log(res.data);
    return res.status === 200 ? res.data.data : [];
  } catch (error) {
    console.error("Get Sections:", error);
    return [];
  }
};

// Post Sections
export const postSections = async (data) => {
  try {
    const res = await api.post("selected-exporter-homepage-sections", {
      member_id: data.memberId,
      sections: data.sectionList,
    });
    // console.log(res.data);
    return res.status === 200 ? res.data.data : [];
  } catch (error) {
    console.error("Get Sections:", error);
    return [];
  }
};

// Product Panels
export const getProductPanels = async () => {
  try {
    const res = await api.get("product-panel");
    // console.table(res.data.data);
    return res.status === 200 ? res.data.data : [];
  } catch (error) {
    console.error("product-panel:", error);
    return [];
  }
};
