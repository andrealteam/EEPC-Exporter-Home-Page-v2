import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center p-5 bg-white rounded shadow">
        <h1 className="display-1 text-danger">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="lead">The page you are looking for does not exist or you don't have permission to view it.</p>
        <p>You will be redirected to the login page in 5 seconds...</p>
        <button 
          onClick={() => {
            logout();
            navigate('/auth');
          }}
          className="btn btn-primary mt-3"
        >
          Go to Login Now
        </button>
      </div>
    </div>
  );
};

export default NotFound;
