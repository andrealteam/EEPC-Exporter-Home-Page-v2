import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getLiveHeader } from "../../services/liveApi";

const WhatsAppPopUp = ({website_url}) => {
  const {
    data: headerData,
    isLoading,
    isError,
    error: headerError,
  } = useQuery({
    queryKey: ["header-live-in-whatsapp", website_url],
    queryFn: () => getLiveHeader(website_url),
  });

  const openWhatsApp = () => {
    let message = "Hello!!";
    const url = `https://wa.me/${
      headerData?.whatsapp
    }?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };
  // Don't render anything if loading, error, or no data
  if (
    isLoading ||
    isError ||
    !headerData ||
    headerData?.whatsapp?.length <= 0
  ) {
    return null;
  }

  // return (
  //   <div style={styles.container} onClick={openWhatsApp}>
  //     <FontAwesomeIcon icon={faWhatsapp} style={styles.icon} />
  //   </div>
  // );
};

const styles = {
  container: {
    position: "fixed",
    bottom: "75px",
    left: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#25D366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  icon: {
    color: "#fff",
    fontSize: "28px",
  },
};

export default WhatsAppPopUp;
