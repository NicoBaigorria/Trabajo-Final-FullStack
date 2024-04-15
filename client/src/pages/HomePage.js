import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleMisLibrosClick = () => {
    navigate("/books");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
      <div className="container mt-4">
      <h1 className="text-center mb-4">Books App</h1> 
      <div className="d-flex justify-content-center"> 
        <button className="btn btn-primary me-3" onClick={handleMisLibrosClick}>Mis Libros</button>
        <button className="btn btn-danger" onClick={handleLogout}>Desconectar</button>
      </div>
    </div>
  );
};

export default HomePage;
