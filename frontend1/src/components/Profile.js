import React from 'react';

const Profile = () => {
  // Obtener el token del almacenamiento local
  const token = localStorage.getItem('authToken');

  return (
    <div>
      <h2>Perfil</h2>
      <p>Token de autenticación: {token}</p>
    </div>
  );
};

export default Profile;