import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import './styled-components/Profile.css';

const EmployeeComponent = () => {
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      {/* Barra de navegación lateral */}
      <nav className="sidebar">
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </nav>

      {/* Contenido principal */}
      <div className="main-content">
        {/* Título en la parte superior derecha */}
        <header>
          <h1>Panel del Empleado</h1>
        </header>

        {/* Vista central */}
        <section className="content">
          <h2>Bienvenido al Panel del Empleado</h2>
          <p>Contenido específico para el empleado.</p>
        </section>
      </div>
    </div>
  );
};

export default EmployeeComponent;