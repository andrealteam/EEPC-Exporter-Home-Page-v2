import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginMember } from "../services/authApi";
import { jwtVerify } from "jose";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [role, setRole] = useState("member");
  const location = useLocation();
  const navigate = useNavigate();
  const loginDataRef = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Redirect if already authenticated
  if (login?.user) {
    const from = location.state?.from?.pathname || "/sections";
    return <Navigate to={from} state={{ from: location }} replace />;
  }

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
          login({ ...payload, token });
          const from = location.state?.from?.pathname || "/sections";
          navigate(from, { replace: true });
        } else {
          toast.error("Invalid or expired token");
          navigate("/auth", { replace: true });
        }
      });
    }
  }, [login, navigate, location.state]);

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

  const onSubmit = async (data) => {
    try {
      const result = await loginMember(data.memberId, data.password);
      if (result.is_valid) {
        login({
          memberId: data.memberId,
          memberName: result.member_name,
          is_valid: result.is_valid,
        });
        toast.success("Login successful");
        const from = location.state?.from?.pathname || "/sections";
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login. Please try again.");
    }
  };

  const renderFormFields = () => (
    <>
      <div className="form-group">
        <label htmlFor="memberId">Member ID</label>
        <div className="input-group">
          <span className="input-group-text">M</span>
          <input
            type="text"
            id="memberId"
            className={`form-control ${errors.memberId ? 'is-invalid' : ''}`}
            {...register("memberId", {
              required: "Member ID is required",
            })}
            disabled={isSubmitting}
          />
        </div>
        {errors.memberId && <div className="invalid-feedback">{errors.memberId.message}</div>}
      </div>
      <div className="form-group mt-3">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          {...register("password", {
            required: "Password is required",
          })}
          disabled={isSubmitting}
        />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>
    </>
  );

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card mt-5">
            <div className="card-body">
              <h2 className="text-center mb-4">Login</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                {renderFormFields()}
                <div className="d-grid gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                </div>
                <div className="text-center mt-3">
                  <Link to="/register" className="text-decoration-none">
                    Don't have an account? Register
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
