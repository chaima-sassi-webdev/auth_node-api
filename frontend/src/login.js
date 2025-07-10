import React, { useState } from "react";
import "./login.css";
import { Link, useNavigate } from 'react-router-dom';


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    try {
     // const response = await fetch("http://localhost:4000/api/auth/login", {
       const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();      
      
      
      if (response.ok) {
        setSuccess("Connexion réussie !");
        localStorage.setItem("token", data.token);
        navigate("/users", { state: { role: data.user.role } });

      } else {
        setError(data.message || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      console.error("Erreur attrapée :", err);
      setError("Erreur serveur, veuillez réessayer plus tard.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Connexion</h2>
        <hr />
        <br />

        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
	  className="field_input"
        />
        <br />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
	{error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
	<button
  type="button"
  onClick={() => navigate("/register")}
>
  Vous n'avez pas de compte ? Créez-en un
</button>


	<br /> <br />
        <p className="forgot-password-link">
	  <a href="/forget-password"
	  >
   	  Mot de passe oublié ?
 	 </a>
	</p>
         <Link
            to="/register"
            style={{
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
  	      background: "white",	
            }}
          >
            Registrez-vous
          </Link>
        
      </form>
    </div>
  );
}

export default Login;
