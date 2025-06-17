import React, { useState, useEffect } from "react";
import "./signup.css";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';

const validateEmail = (email) => {
  // Regex simple qui exige un point dans le domaine (ex: .com)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const AlertBox = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="alert-box">
      {message}
    </div>
  );
};

function Signup() {
  const [roleRadio, setRoleRadio] = useState("");
  const [roleSelect, setRoleSelect] = useState("user");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Vérifier si un superadmin existe déjà
  const checkSuperadminExists = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/check-superadmin");
      const data = await res.json();
      return data.exists;
    } catch (err) {
      console.error("Erreur lors de la vérification du superadmin :", err);
      return false;
    }
  };

  const handleRadioChange = async (e) => {
    const value = e.target.value;
    setRoleRadio(value);
    setError("");

    if (value === "superadmin") {
      const exists = await checkSuperadminExists();
      if (exists) {
        Swal.fire({
          icon: 'error',
          title: 'Superadmin existe déjà',
          text: 'Un superadmin est déjà enregistré dans le système.',
          confirmButtonText: 'OK'
      });
      setRoleRadio("autre");
      setRoleSelect("user");
    }
   }
  };

  const handleSelectChange = (e) => {
    setRoleSelect(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("L’e-mail est requis.");
      return;
    }

    if (!validateEmail(email)) {
     setError("Format d’e-mail invalide. Exemple : exemple@mail.com");
     return;
    }
    if (!username || !email || !password || !confirmPassword) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const finalRole = roleRadio === "autre" ? roleSelect : roleRadio;

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
          role: finalRole || "user",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("✅ Inscription réussie !");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRoleRadio("");
        setRoleSelect("user");
      } else {
        setError(data.message || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      setError("Erreur serveur. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Inscription</h2>
        <hr />
        <p className="vous-etes">Vous êtes :</p>

        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="role"
              value="superadmin"
              checked={roleRadio === "superadmin"}
              onChange={handleRadioChange}
            />
            Superadmin
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="role"
              value="autre"
              checked={roleRadio === "autre"}
              onChange={handleRadioChange}
            />
            Autre
          </label>
        </div>
	        
  	{error && roleRadio !== "superadmin" && (
            <AlertBox message={error} onClose={() => setError("")} />
        )}


        {roleRadio === "autre" && (
          <div className="select-container">
            <select
              value={roleSelect}
              onChange={handleSelectChange}
              className="role-select"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
        )}

        <p className="vous-etes">Nom d'utilisateur :</p>
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Entrez votre nom"
            className="username-input"
            required
          />
        </div>

        <p className="vous-etes">Email :</p>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre email"
            className="username-input"
            required
          />
        </div>

        <p className="vous-etes">Mot de passe :</p>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            className="username-input"
            required
          />
        </div>

        <p className="vous-etes">Confirmer mot de passe :</p>
        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmez le mot de passe"
            className="username-input"
            required
          />
        </div>

        <button type="submit" className="submit-button">S'inscrire</button>

        <p>
          Vous avez un compte ?{" "}
          <Link
            to="/"
            style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
          >
            Connectez-vous
          </Link>
        </p>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </div>
  );
}

export default Signup;
