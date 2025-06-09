import React, { useState } from "react";
import "./login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");



  const verifyEmail = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setEmailVerified(true);
        setMessage("Email vérifié. Veuillez entrer un nouveau mot de passe.");
      } else {
        setMessage(data.message || "Email non trouvé.");
      }
    } catch (err) {
      setMessage("Erreur serveur.");
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();
      setMessage(data.message || "Mot de passe mis à jour !");
    } catch (err) {
      setMessage("Erreur lors de la mise à jour.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message || "Vérifiez votre boîte mail.");
    } catch (err) {
      setMessage("Erreur, veuillez réessayer.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Mot de passe oublié</h2>
	{!emailVerified ? (
        <form onSubmit={verifyEmail}>
          <input
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Vérifier l'e-mail</button>
        </form>
        ) : (
           <form onSubmit={updatePassword}>
             <input
               type="password"
               placeholder="Nouveau mot de passe"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               required
           />
             <button type="submit">Réinitialiser</button>
           </form>
        )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default ForgotPassword;
