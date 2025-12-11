import axios from "axios";

// Prefer environment config so we hit the real backend (not the Vercel SPA)
const rawApiBase =
  import.meta.env?.VITE_API_BASE_URL ||
  "https://www.eepcindia.org/backend/api/";

// Keep a single trailing slash for axios baseURL
const normalisedApiBase = rawApiBase.endsWith("/")
  ? rawApiBase
  : `${rawApiBase}/`;

// File base falls back to stripping "/api"
export const baseFileURL = normalisedApiBase.replace(/api\/?$/, "");

// -----------------------
// AXIOS INSTANCE
// -----------------------
export const api = axios.create({
  baseURL: normalisedApiBase,

  // Prevent React Query from throwing unnecessary 304 errors
  validateStatus: (status) => status >= 200 && status < 400,
});

// -----------------------
// CONSTANT URLs
// -----------------------
export const eepcURLS = "https://app.eepcindia.com/ems/webservices/";
export const myParticipationsURL = eepcURLS + "get_participation_details";

// -----------------------
// GST Verification (YOUR SERVER)
// -----------------------
export const verifyGSTFromServer = async (gstin) => {
  try {
    const res = await api.get(`gst-number-verification/${gstin}`);

    if (res.status === 200 && res.data) {
      return res.data.data;
    } else {
      return {};
    }
  } catch (error) {
    console.error("GST Verification API Error:", error);
    return {};
  }
};

// -----------------------
// eCatalogue
// -----------------------
export const getEcatalogue = async (member_id) => {
  try {
    const res = await api.get(`e_catalogue_verification/${member_id}`);

    if (res.status === 200 && res.data) {
      return res.data.data;
    } else {
      return {};
    }
  } catch (error) {
    console.error("eCatalogue API Error:", error);
    return {};
  }
};

// -----------------------
// Get Access Token (Masters India)
// -----------------------
export const getAccessToken = async () => {
  try {
    const res = await axios.post(
      "https://commonapi.mastersindia.co/oauth/access_token",
      {
        username: "amitra@eepcindia.net",
        password: "Adhip@123#",
        client_id: "OUDtubRPJZmPidYYqm",
        client_secret: "LsNynTnInQbsPwDpFMBMkxVT",
        grant_type: "password",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.access_token;
  } catch (error) {
    console.error("Masters India Token Error:", error);
    return null;
  }
};

// -----------------------
// Physical Events (EMS API)
// -----------------------
export const getPhysicalEvents = async (member_id) => {
  try {
    const formData = new FormData();
    formData.append("mem_id", `M${member_id}`);

    const res = await axios.post(myParticipationsURL, formData);

    if (res.status === 200 && res.data.status) {
      return res.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Physical Events API Error:", error);
    return [];
  }
};
