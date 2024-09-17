import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', { // Asegúrate de usar el endpoint correcto
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // Maneja la respuesta de la solicitud
            console.log(response.data);
            setMessage('Inicio de sesión exitoso');
            // Guardar el token en el almacenamiento local
            localStorage.setItem('authToken', response.data.token);

            // Redirigir a otra página
            navigate('/Profile'); // Cambia '/profile' a la ruta deseada
        } catch (error) {
            console.error('Error en la solicitud:', error);
            setMessage('Error en el inicio de sesión');
        }
    };

    return (
        <div>
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre de usuario:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Iniciar sesión</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;