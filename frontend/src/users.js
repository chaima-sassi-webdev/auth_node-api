import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./users.css";
function UsersList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("user");
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role") || "user";
    setCurrentUserRole(role);
    fetch("http://localhost:5000/users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des utilisateurs");
        }
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message));
  }, []);
   
   const handleDelete = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}`, {
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
      const res = await fetch(`http://localhost:5000/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: currentUserRole, newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erreur modification de rôle:", error);
    }
  };
  const handleLogout = () => {
    localStorage.clear();  // vide localStorage (token, role, etc.)
    navigate("/");    // redirige vers la page login (ajuste le chemin si besoin)
  };  
  return (
    <div className="users-container">
      <div className="users-header">
        <h2>Liste des Utilisateurs</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      <h2>Liste des Utilisateurs</h2>
      {error && <p className="error">{error}</p>}
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Rôle</th>
               {currentUserRole === "admin" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>
		   {currentUserRole === "admin" ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  ) : (
                    user.role
                  )}
		</td>
 		{currentUserRole === "admin" && (
                  <td>
                    <button onClick={() => handleDelete(user.id)}>Supprimer</button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={currentUserRole === "admin" ? 4 : 3}>Aucun utilisateur trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsersList;
