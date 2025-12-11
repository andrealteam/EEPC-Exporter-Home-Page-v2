import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProductPanels, registerExporter } from "../services/authApi";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import { getAccessToken, verifyGSTFromServer } from "../services/api";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const exporterData = location.state?.exporterData;
  const [gstNumber, setGstNumber] = useState("");
  const [isGSTVerified, setIsGSTVerified] = useState(false);
  const [gstError, setGstError] = useState("");
  const [selectedPanels, setSelectedPanels] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm();

  const {
    data: productPanel,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["productPanel"],
    queryFn: getProductPanels,
    gcTime: 180000,
  });

  useEffect(() => {
    if (!exporterData) {
      // Redirect back if no data
      navigate("/");
    }
  }, [exporterData, navigate]);

  const panelOptions =
    productPanel?.map((panel) => ({
      value: panel.panel_name,
      label: panel.panel_name,
    })) || [];

  const onSubmit = async (data) => {
    // if (!isGSTVerified) {
    //   setGstError("Please verify GST before submitting.");
    //   return;
    // }
    const registerMember = await registerExporter(data, gstNumber);
    try {
      if (registerMember.status) {
        toast.success(registerMember?.message);
        navigate("/review");
      } else {
        toast.error(registerMember?.message);
      }
    } catch (error) {
      toast.error(registerMember?.message);
      console.error("Error during verify:", error);
    }
  };

  const handleGSTVerify = async () => {
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstRegex.test(gstNumber)) {
      setGstError("Invalid GST number format");
      setIsGSTVerified(false);
      return;
    }

    setGstError("Verifying...");

    // const token = await getAccessToken(); // fetch token before API call
    // console.log("Access Token:", token);
    const result = await verifyGSTFromServer(gstNumber);
    if (!result.error && result.data) {
      if (
        exporterData.name === result.data.lgnm ||
        exporterData.name === result.data.tradeNam
      ) {
        // ✅ GSTIN is verified and matches user's name
        setGstError("");
        setIsGSTVerified(true);
      } else {
        // ❌ GSTIN is valid, but name doesn't match
        setGstError("GST Not Verified");
        setIsGSTVerified(false);
      }
    } else {
      // ❌ GSTIN is invalid or API error
      setGstError(result.message || "Failed to verify GST number.");
      setIsGSTVerified(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="login-container">
        <h3 className="">Exporter Registration</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="registration-form-split">
            <div className="left-form-part">
              <div>
                <label htmlFor="memberId">Member ID</label>
                <div className="input-group">
                  <span className="input-group-text">M</span>
                  <input
                    type="text"
                    id="memberId"
                    {...register("memberId", {
                      required: "Member ID is required",
                    })}
                    value={exporterData?.member_id}
                    disabled
                  />
                </div>
                {errors.memberId && (
                  <p className="error">{errors.memberId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="gstNo">GST Number</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    id="gstNo"
                    value={gstNumber}
                    onChange={(e) => {
                      setGstNumber(e.target.value.toUpperCase());
                      setIsGSTVerified(false); // reset verification on change
                    }}
                    placeholder="Enter GST number"
                  />
                  <button
                    type="button"
                    onClick={handleGSTVerify}
                    className="btn"
                  >
                    Verify
                  </button>
                </div>
                {gstError && <p className="error">{gstError}</p>}
                {isGSTVerified && <p className="success">GST Verified ✅</p>}
              </div>

              <Select
                isMulti
                options={panelOptions}
                value={selectedPanels}
                onChange={(selected) => {
                  if (selected.length <= 5) {
                    setSelectedPanels(selected);
                    setValue(
                      "panels",
                      selected.map((s) => s.value)
                    );
                  }
                }}
                placeholder="Search and select panels"
                classNamePrefix="custom-select"
              />

              {/* Hidden input to integrate with react-hook-form */}
              <input
                type="hidden"
                {...register("panels", {
                  required: "Please select at least one panel",
                })}
              />
              {errors.panels && (
                <p className="error">{errors.panels.message}</p>
              )}

              <div>
                <label htmlFor="eicNo">IEC Number</label>
                <input
                  type="text"
                  id="eicNo"
                  {...register("eicNo", {
                    required: "EIC No. is required",
                  })}
                  value={exporterData?.eic_no}
                  disabled
                />
                {errors.eicNo && <p>{errors.eicNo.message}</p>}
              </div>

              <div>
                <label htmlFor="dunNo">DUN Number</label>

                <input
                  type="text"
                  id="dunNo"
                  {...register("dunNo", {
                    required: "DUN No. is required",
                  })}
                  placeholder="Enter DUN number"
                />

                {errors.dunNo && (
                  <p style={{ color: "red", fontSize: "14px" }}>
                    {errors.dunNo.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div>
                <label htmlFor="eicNo">Company Name</label>
                <input
                  type="text"
                  id="name"
                  {...register("name", {
                    required: "Company name is required",
                  })}
                  defaultValue={exporterData?.name}
                  placeholder="Enter company name"
                />
                {errors.name && <p className="error">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                  defaultValue={exporterData?.phone}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="error">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email">Email ID</label>
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email ID is required",
                  })}
                  defaultValue={exporterData?.email}
                  placeholder="Enter email id"
                />
                {errors.email && (
                  <p className="error">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="address">Address</label>
                <textarea
                  rows="3"
                  cols="50"
                  id="address"
                  {...register("address", {
                    required: "Address is required",
                  })}
                  defaultValue={exporterData?.address}
                  placeholder="Enter company address"
                />
                {errors.address && (
                  <p className="error">{errors.address.message}</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn"
            disabled={
              isSubmitting
              // || !isGSTVerified
            }
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
