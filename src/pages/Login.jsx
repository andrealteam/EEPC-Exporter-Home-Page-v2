import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginMember } from "../services/authApi";
import { jwtVerify } from "jose";

const Login = () => {
  const [role, setRole] = useState("member");
  const location = useLocation();
  const navigate = useNavigate();
  const loginDataRef = useRef(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Convert secret string to a `Uint8Array`
  const secret = new TextEncoder().encode("fgghw53ujf8836d");

  async function verifyToken(token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      return payload;
    } catch (err) {
      console.error("Token verification failed", err);
      return null;
    }
  }

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      verifyToken(token).then((payload) => {
        if (payload) {
          // sessionStorage.setItem("exporterData", JSON.stringify(payload));
          navigate("/edit", { state: { exporterData: payload, token: token } });
        } else {
          window.location.href =
            // "https://prodis.eepcindia.org/auth/login"
            "https://prodis.eepcindia.org/auth/login";
        }
      });
    } else {
      window.location.href =
        // "https://prodis.eepcindia.org/auth/login"
        "https://prodis.eepcindia.org/auth/login";
    }
  }, []);

  // const onSubmit = async (data) => {
  //       const success = await loginMember(data.memberId, data.password);
  //       console.log("success check",success)
  //     if (success.is_valid) {
  //       toast.success("Login successful");
  //       sessionStorage.setItem("exporterData", JSON.stringify(success.is_valid));

  //       navigate("/edit", { state: { exporterData: success.is_valid } });

  //     } else {
  //       toast.error("Login failed. Please check your credentials.");
  //     }
  //   };

  // const renderFormFields = () => {
  //     switch (role) {
  //       case "member":
  //         return (
  //           <>
  //             <div>
  //               <label htmlFor="memberId">Member ID</label>
  //               <div className="input-group">
  //                 <span className="input-group-text">M</span>
  //                 <input
  //                   type="text"
  //                   id="memberId"
  //                   {...register("memberId", {
  //                     required: "Member ID is required",
  //                   })}
  //                 />
  //               </div>
  //               {errors.memberId && <p>{errors.memberId.message}</p>}
  //             </div>
  //             <div>
  //               <label htmlFor="password">Password</label>
  //               <input
  //                 type="password"
  //                 id="password"
  //                 {...register("password", { required: "Password is required" })}
  //               />
  //               {errors.password && <p>{errors.password.message}</p>}
  //             </div>

  //           </>
  //         );

  //       default:
  //         return null;
  //     }
  // };

  return (
    <div className="center-screen">
      {/* <div className="login-container">
                <div className="">
      <h2>Login</h2>
      

      <form onSubmit={handleSubmit(onSubmit)}>
        {renderFormFields()}
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
    </div> */}
    </div>
  );
};

export default Login;
