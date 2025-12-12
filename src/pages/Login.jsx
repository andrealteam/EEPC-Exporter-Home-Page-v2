import React, { useEffect, useRef, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginMember } from "../services/authApi";
import { jwtVerify } from "jose";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
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
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/sections";
    return <Navigate to={from} replace />;
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
          login({ token, ...payload });
          const from = location.state?.from?.pathname || "/sections";
          navigate(from, { replace: true });
        } else {
          toast.error("Invalid or expired token");
          navigate("/auth", { replace: true });
        }
      });
    }
  }, [login, navigate, location.state]);

  const onSubmit = async (data) => {
    try {
      const result = await loginMember(data.memberId, data.password);
      if (result.is_valid) {
        login({
          memberId: data.memberId,
          memberName: result.member_name,
          is_valid: result.is_valid,
          // Add any other user data you need
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

  const renderFormFields = () => {
    switch (role) {
      case "member":
        return (
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
              {errors.memberId && <div className="invalid-feedback d-block">{errors.memberId.message}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
                disabled={isSubmitting}
              />
              {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card mt-5">
            <div className="card-body">
              <h2 className="text-center mb-4">Login</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                {renderFormFields()}
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
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
