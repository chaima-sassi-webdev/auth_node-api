import React, { useEffect, useState} from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import "./users.css";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState();
  const [editingUserId, setEditingUserId] = useState();
  const [searchEmail, setSearchEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const roleFromNavigate = location.state?.role || "user";

  useEffect(() => {
    setCurrentUserRole(roleFromNavigate);

    fetch("http://localhost:4000/api/auth/users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des utilisateurs");
         }
          return res.json();
       })
       .then((data) => setUsers(data))
       .catch((err) => setError(err.message));
       // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [roleFromNavigate]);  // <-- le nom doit correspondre exactement


  const displayRole = (role) => {
    const roleMap = {
      user: "Utilisateur",
      admin: "Administrateur",
      superadmin: "Super Administrateur"
    };
    return roleMap[role] || role;
  };

  const handleDelete = async (userId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: currentUserRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:4000/api/auth/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
        setEditingUserId(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erreur modification de rôle:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // si le backend utilise jwt.verify()
        },
      });

      if (response.ok) {
        localStorage.clear(); // supprime le token
        navigate("/"); // redirection vers page login ou accueil
      } else {
        console.error("Erreur lors de la déconnexion");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  }; 

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="users-container">
      <div className="users-header">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <h2>Liste des Utilisateurs</h2>
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Rechercher par email..."
          className="filter-input"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>
      {error && <p className="error">{error}</p>}
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Rôle</th>
            {(currentUserRole === "admin" || currentUserRole === "superadmin") && (
              <th>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>
                  {editingUserId === user.id ? (
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                      <option value="superadmin">Super Administrateur</option>
                    </select>
                  ) : (
                    displayRole(user.role)
                  )}
                </td>
                {(currentUserRole === "admin" || currentUserRole === "superadmin") && (
                  <td>
                    <button onClick={() => setEditingUserId(user.id)}>✏️</button>
                    <button onClick={() => handleDelete(user.id)}>🗑️</button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>Aucun utilisateur trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsersList;
