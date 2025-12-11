import React from "react";
import error401 from "../assets/images/401.png";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="text-center my-4">
      <img src={error401} alt="Unauthorized" className="mb-4 img-fluid" />
      <h2 className="">You are not authorized to visit this page</h2>
      <Link to="/" className="btn btn-outline-primary py-2 px-3 rounded mt-3 mb-3 text-center">
        Go Home
      </Link>
    </div>
  );
};

export default Unauthorized;
