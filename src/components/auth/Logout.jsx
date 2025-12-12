import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // Clear any additional session data if needed
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login page after logout
        navigate('/auth', { replace: true });
        
        // Force a full page reload to clear any cached data
        window.location.reload();
      } catch (error) {
        console.error('Logout error:', error);
        navigate('/auth', { replace: true });
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Logging out...</span>
        </div>
        <p className="mt-2">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout;
