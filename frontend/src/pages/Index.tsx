
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the login page
    navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to login...</p>
    </div>
  );
};

export default Index;
