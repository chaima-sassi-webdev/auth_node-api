import React, { useState } from "react";
import "./App.css";
import { Link } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState("user");

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || !confirmPassword) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(data.message || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Erreur serveur, veuillez réessayer plus tard.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Inscription</h2>
	<hr />
	<br />
	<p align="center"> Vous êtes : </p>
	<br />
	<select value={role} onChange={(e) => setRole(e.target.value)} required>
	  <option value="user">Utilisateur</option>
	  <option value="admin">Administrateur</option>
	</select>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirmer mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit"> S'inscrire </button>
        <br />
        <br />
        <p>
          Vous avez de compte ?{" "}
          <Link to="/"
           style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
           >
             Connectez-vous
          </Link>
        </p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </div>
  );
}

export default Signup;
