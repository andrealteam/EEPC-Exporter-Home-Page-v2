import React from "react";
import error404 from "../assets/images/404.png";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="text-center my-4">
      <img src={error404} alt="Page Not Found" className="mb-4 img-fluid" />
      <h1 className="">Page Not Found</h1>
      <Link
        to="/"
        className="btn btn-outline-primary py-2 px-3 rounded mt-3 mb-3 text-center"
      >
        Go Home
      </Link>
    </div>
  );
};

export default PageNotFound;
