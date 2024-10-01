import React from 'react';
import AdminComponent from './AdminComponent';  // Componente específico para el administrador
import EmployeeComponent from './EmployeeComponent';  // Componente específico para el empleado

const Profile = () => {
  const userRole = localStorage.getItem('role'); // Asegúrate de almacenar el rol en localStorage al iniciar sesión

  return (
    <div>
      {userRole === 'admin' ? (
        <AdminComponent />
      ) : (
        <EmployeeComponent />
      )}
    </div>
  );
};

export default Profile;
