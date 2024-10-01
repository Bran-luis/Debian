import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styled-components/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      // Enviar solicitud de autenticación
      const response = await axios.post('http://localhost:3000/api/auth/login', { username, password }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const userData = response.data;
      setMessage('Inicio de sesión exitoso');
      localStorage.setItem('authToken', userData.token);
      localStorage.setItem('role', userData.role);
  
      // Enviar la asistencia solo si el login fue exitoso
      await axios.post('http://localhost:3000/api/asistencias/registrar', {
        empleado_id: userData.userId, // Asegúrate de que `userId` sea el ID del empleado
        estado: 'Presente', // Estado por defecto al iniciar sesión
      }, {
        headers: {
          'Authorization': `Bearer ${userData.token}`, // Incluye el token de autenticación
          'Content-Type': 'application/json'
        }
      });
  
      // Redirigir al perfil del usuario
      navigate('/Profile');
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setMessage('Error en el inicio de sesión');
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <h2 className="login-h2">Iniciar sesión</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label className="login-label">Nombre de usuario:</label>
            <input
              className="login-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="login-label">Contraseña:</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="login-button" type="submit">Iniciar sesión</button>
        </form>
        {message && <p className="login-p">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
