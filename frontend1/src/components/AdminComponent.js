import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styled-components/Profile.css';

const AdminComponent = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [area, setArea] = useState('Informatica');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [assistances, setAssistances] = useState([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedOption === 'Usuarios') {
      fetchUsers();
    } else if (selectedOption === 'Asistencias') {
      fetchAssistances();
    }
  }, [selectedOption]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/users');
      const result = await response.json();
      if (response.ok) {
        setUsers(result);
        setFilteredUsers(result);
      } else {
        setMessage('Error al obtener usuarios');
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setMessage('Error en el servidor');
    }
  };

  const fetchAssistances = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/asistencias/ultimas');
      const result = await response.json();
      if (response.ok) {
        console.log(result); // Revisa la estructura de los datos
        setAssistances(result);
      } else {
        setMessage('Error al obtener asistencias');
      }
    } catch (error) {
      console.error('Error al obtener asistencias:', error);
      setMessage('Error en el servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleFilterByArea = (selectedArea) => {
    if (selectedArea === 'Todos') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => user.area === selectedArea);
      setFilteredUsers(filtered);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (isEditing) {
      handleUpdateUser(editUserId);
    } else {
      try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, role, area }),
        });

        const result = await response.json();
        if (response.ok) {
          setMessage('Usuario creado exitosamente');
          fetchUsers();
          setShowAddUserForm(false);
          clearForm();
        } else {
          setMessage(result.error || 'Error al crear el usuario');
        }
      } catch (error) {
        console.error('Error al crear usuario:', error);
        setMessage('Error en el servidor');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/auth/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Usuario eliminado correctamente');
        fetchUsers();
      } else {
        setMessage(result.error || 'Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setMessage('Error en el servidor');
    }
  };

  const handleEditUser = (user) => {
    setIsEditing(true);
    setEditUserId(user.id);
    setUsername(user.username);
    setRole(user.role);
    setArea(user.area);
    setShowAddUserForm(true);
  };

  const handleUpdateUser = async (userId) => {
    try {
      const updateData = {
        username,
        role,
        area,
      };

      if (password !== '') {
        updateData.password = password;
      }

      const response = await fetch(`http://localhost:3000/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Usuario actualizado correctamente');
        setUsername('');
        setPassword('');
        setRole('employee');
        setArea('Informatica');
        setShowAddUserForm(false);
        setIsEditing(false);
        fetchUsers();
      } else {
        setMessage(result.error || 'Error al actualizar el usuario');
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setMessage('Error en el servidor');
    }
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setRole('employee');
    setArea('Informatica');
    setMessage('');
    setIsEditing(false);
    setEditUserId(null);
  };

  return (
    <div className="admin-dashboard">
      <nav className="sidebar">
        <div className="user-info">
          <p>Bienvenido, Admin</p>
        </div>
        <ul>
          <li onClick={() => setSelectedOption('Inicio')}>Inicio</li>
          <li onClick={() => setSelectedOption('Usuarios')}>Usuarios</li>
          <li onClick={() => setSelectedOption('Asistencias')}>Asistencias</li>
          <li onClick={() => setSelectedOption('Configuración')}>Configuración</li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </nav>

      <div className="main-content">
        <section className="content">
          {selectedOption === 'Usuarios' ? (
            <div>
              <h2>Usuarios</h2>
              <div className="filter-buttons">
                <button onClick={() => handleFilterByArea('Todos')}>Todos</button>
                <button onClick={() => handleFilterByArea('Informatica')}>Informática</button>
                <button onClick={() => handleFilterByArea('Contabilidad')}>Contabilidad</button>
                <button onClick={() => handleFilterByArea('Administración')}>Administración</button>
              </div>
              <div className="user-list-container">
                {filteredUsers.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre de Usuario</th>
                        <th>Rol</th>
                        <th>Área</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.role}</td>
                          <td>{user.area}</td>
                          <td>
                            <button className="edit-button" onClick={() => handleEditUser(user)}>Editar</button>
                            <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hay usuarios en esta área.</p>
                )}
              </div>
              <button className="add-user-button" onClick={() => {
                setIsEditing(false);
                setShowAddUserForm(true);
                clearForm();
              }}>
                Agregar Usuario
              </button>

              {showAddUserForm && (
                <div className="modal">
                  <div className="modal-content">
                    <span className="close-button" onClick={() => {
                      setShowAddUserForm(false);
                      clearForm();
                    }}>&times;</span>
                    <h3>{isEditing ? 'Editar Usuario' : 'Agregar Usuario'}</h3>
                    <form onSubmit={handleCreateUser}>
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
                          required={!isEditing}
                        />
                      </div>
                      <div>
                        <label>Rol:</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} required>
                          <option value="admin">Administrador</option>
                          <option value="employee">Empleado</option>
                        </select>
                      </div>
                      <div>
                        <label>Área:</label>
                        <select value={area} onChange={(e) => setArea(e.target.value)} required>
                          <option value="Informatica">Informática</option>
                          <option value="Contabilidad">Contabilidad</option>
                          <option value="Administración">Administración</option>
                        </select>
                      </div>
                      <button type="submit">
                        {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
                      </button>
                    </form>
                    {message && <p>{message}</p>}
                  </div>
                </div>
              )}
            </div>
          ) : selectedOption === 'Asistencias' ? (
            <div>
              <h2>Asistencias</h2>
              <div className="user-list-container">
                {assistances.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre del Empleado</th>
                        <th>Área</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Nivel de Alcohol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assistances.map((assistance) => (
                        <tr key={assistance.id}>
                          <td>{assistance.User ? assistance.User.id : 'N/A'}</td>
                          <td>{assistance.User ? assistance.User.username : 'N/A'}</td>
                          <td>{assistance.User ? assistance.User.area : 'N/A'}</td>
                          <td>{new Date(assistance.fecha).toLocaleString()}</td>
                          <td>{assistance.estado}</td>
                          <td>{assistance.nivelAlcohol || 'No disponible'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hay asistencias registradas.</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h2>{selectedOption}</h2>
              <p>Esta es la vista para {selectedOption}.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminComponent;