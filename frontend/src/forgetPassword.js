import React, { useState } from "react";
import "./login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";


  const verifyEmail = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/verifyEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setEmailVerified(true);
        setMessage("Email vérifié. Veuillez entrer un nouveau mot de passe.");
      } else {
        setMessage(data.message || "Email non trouvé.");
      }
    } catch (err) {
        console.error("Erreur lors de la vérification de l'email :", err);
        setMessage("Ereur serveur.");
    }
  };
  const updatePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();
      setMessage(data.message || "Mot de passe mis à jour !");
    } catch (err) {
	console.error("Erreur lors de la mise à jour du mot de passe :", err);
        setMessage("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Mot de passe oublié</h2>
	{!emailVerified ? (
        <form onSubmit={verifyEmail} className="forgot-form">
          <input
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
	    className="field_pass"
            required
          />
          <button type="submit">Vérifier l'e-mail</button>
        </form>
        ) : (
           <form onSubmit={updatePassword} className="forgot-form">
             <input
               type="password"
               placeholder="Nouveau mot de passe"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
	       className="field_pass"
               required
           />
             <button type="submit">Réinitialiser</button>
           </form>
        )}
      {message && <p className="message-forgetPassword">{message}</p>}
    </div>
  );
}

export default ForgotPassword;
