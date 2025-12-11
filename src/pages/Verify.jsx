import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../assets/css/popup.css";
import { verifyExporter } from "../services/authApi";

const Verify = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const exporter = await verifyExporter(data);
    try {
      if (exporter.status) {
        toast.success("Member Verified");
        navigate("/register", { state: { exporterData: exporter.data } });
      } else {
        toast.error("Member not found!");
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error during verify:", error);
    }
  };

  return (
    <div className="center-screen">
      <div className="login-container">
        <h3 className="">Exporter Verification</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
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
              />
            </div>
            {errors.memberId && <p className="error">{errors.memberId.message}</p>}
          </div>
          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Verify;
