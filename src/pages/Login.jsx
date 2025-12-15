import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { jwtVerify } from "jose";
import { handleSuccessfulLogin } from "../utils/auth";

const Login = () => {
  const [searchParams] = useSearchParams();
  
  // Convert secret string to a `Uint8Array`
  const secret = new TextEncoder().encode("fgghw53ujf8836d");

  useEffect(() => {
    const verifyAndLogin = async () => {
      const token = searchParams.get("token");
      
      if (!token) {
        // If no token, redirect to the main auth URL
        window.location.href = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";
        return;
      }

      try {
        // Verify the JWT token
        const { payload } = await jwtVerify(token, secret);
        
        if (payload) {
          // Handle successful login with the token
          handleSuccessfulLogin({
            token,
            ...payload,
            // Add any additional user data from the token
            exp: payload.exp || Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
          });
        } else {
          // If token is invalid, redirect to login
          throw new Error("Invalid token");
        }
      } catch (error) {
        console.error("Login error:", error);
        window.location.href = "https://eepc-exporter-home-page-v2.vercel.app/auth/login";
      }
    };

    verifyAndLogin();
  }, [searchParams]);

  // Show loading state while processing
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Logging in...</span>
        </div>
        <p className="mt-3">Processing login...</p>
      </div>
    </div>
  );
};

export default Login;
