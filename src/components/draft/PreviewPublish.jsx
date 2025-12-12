import React, { useState, useEffect } from "react";
import { SignJWT } from "jose";
import { useNavigate } from "react-router-dom";
import { postEditExporterHomePage, postLiveWebsite } from "../../services/liveApi";
import toast from "react-hot-toast";
import { getProducts, getWhoWeAre } from "../../services/draftApi";
import { useQuery } from "@tanstack/react-query";
import { useChangeTracker } from "../../contexts/ChangeTrackerContext";

const PreviewPublish = ({ memberId, website_url, rejectionNumbers }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [jwtToken, setJwtToken] = useState('');
  const navigate = useNavigate();
  const { hasChanges, resetAfterPreviewOrPublish, markAsChanged } = useChangeTracker();

  // Fetch products data
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products-draft", memberId],
    queryFn: () => getProducts(memberId),
    enabled: !!memberId,
  });

  // Fetch about data
  const { data: aboutData, isLoading: isAboutLoading } = useQuery({
    queryKey: ["about-draft", memberId],
    queryFn: () => getWhoWeAre(memberId),
    enabled: !!memberId,
  });

  // Generate JWT token for preview
  const generateToken = async () => {
    if (!memberId) {
      throw new Error("Missing memberId for token generation");
    }

    try {
      const secretValue =
        import.meta.env?.VITE_JWT_SECRET ||
        "fgghw53ujf8836d"; // fallback to previous default

      const secret = new TextEncoder().encode(secretValue);
      const token = await new SignJWT({
        memberId: memberId,
        iss: "eepcindia",
        role: "preview_user",
        timestamp: Date.now(),
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1h")
        .sign(secret);
      return token;
    } catch (error) {
      console.error("Token generation failed:", error);
      throw new Error("Failed to generate preview token");
    }
  };

  // Initialize token on component mount
  useEffect(() => {
    const initToken = async () => {
      if (memberId) {
        try {
          const token = await generateToken();
          setJwtToken(token);
        } catch (error) {
          console.error("Initial token generation failed:", error);
        }
      }
    };
    
    initToken();
  }, [memberId]);

  // Handle preview button click
  const handlePreview = async () => {
    try {
      const hasProducts = Array.isArray(productsData)
        ? productsData.length > 0
        : Array.isArray(productsData?.data)
        ? productsData.data.length > 0
        : !!productsData && Object.keys(productsData).length > 0;

      const hasAbout =
        Array.isArray(aboutData) ? aboutData.length > 0 : !!aboutData && Object.keys(aboutData).length > 0;

      if (!hasProducts || !hasAbout) {
        throw new Error(aboutData ? 
          "Please add at least 1 product before previewing." : 
          "Please complete 'About Our Company' and 'Basic Information' sections first."
        );
      }

      const token = jwtToken || (await generateToken());
      const previewUrl = `${window.location.origin}/preview/${encodeURIComponent(token)}`;
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      // Disable buttons after preview
      resetAfterPreviewOrPublish();
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  // Handle publish button click
  const handlePublish = () => {
    const hasProducts = Array.isArray(productsData)
      ? productsData.length > 0
      : Array.isArray(productsData?.data)
      ? productsData.data.length > 0
      : !!productsData && Object.keys(productsData).length > 0;

    const hasAbout =
      Array.isArray(aboutData) ? aboutData.length > 0 : !!aboutData && Object.keys(aboutData).length > 0;

    if (rejectionNumbers.length > 0 || !hasProducts || !hasAbout) {
      const message = !hasAbout ? 
        "Please complete 'About Our Company' and 'Basic Information' sections first." :
        rejectionNumbers.length > 0 ? 
        "Please resolve all rejection issues before publishing." :
        "Please add at least 1 product before publishing.";
      toast.error(message, { position: "top-center", autoClose: 3000 });
      return;
    }
    setIsSubmitted(true);
  };

  // Confirm and handle publishing
  const confirmPublish = async () => {
    try {
      setIsSubmitted(false);
      const token = jwtToken || (await generateToken());
      
      const [liveRes] = await Promise.all([
        postLiveWebsite(token, memberId),
        postEditExporterHomePage(memberId)
      ]);

      if (liveRes?.status) {
        toast.success(liveRes.message);
        // Disable buttons after publish
        resetAfterPreviewOrPublish();
        navigate("/final-review", { replace: true });
      } else {
        throw new Error(liveRes?.message || "Error publishing website");
      }
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(error.message || "Failed to publish website", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const isLoading = isProductsLoading || isAboutLoading;
  // Enable buttons when there are changes, regardless of previous preview/publish
  const isPreviewDisabled = isLoading || !hasChanges;
  const isPublishDisabled = isLoading || !hasChanges;

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <header className="header" style={{ position: "relative", paddingTop: "66px" }}>
      <div className="update-btn" style={{ zIndex: 9999 }}>
        <button
          className={`edit-btn-2 btn-primary ${isPreviewDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isPreviewDisabled}
          onClick={handlePreview}
        >
          Preview
        </button>

        <button
          className={`edit-btn-1 btn-primary ${isPublishDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isPublishDisabled}
          onClick={handlePublish}
        >
          Publish
        </button>
      </div>

      {/* Publish Confirmation Modal */}
      {isSubmitted && (
        <div 
          className="modal d-block" 
          style={{ 
            backgroundColor: "rgba(0,0,0,0.5)", 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1050 
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center p-4">
                <h4 className="mb-4">Do you want to publish your website?</h4>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={confirmPublish}
                  >
                    Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PreviewPublish;