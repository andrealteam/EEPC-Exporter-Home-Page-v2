import { useEffect } from "react";

const Favicon = ({ iconUrl }) => {
  useEffect(() => {
    if (!iconUrl) return;

    // Pehle purana favicon remove karo
    const existingFavicon = document.querySelector("link[rel='icon']");
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Naya favicon add karo
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = iconUrl;
    document.head.appendChild(link);
  }, [iconUrl]);

  return null; // Ye component UI render nahi karega
};

export default Favicon;
