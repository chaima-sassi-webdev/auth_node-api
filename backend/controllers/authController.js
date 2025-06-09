// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Assure-toi que ce chemin est correct
require('dotenv').config();

// Fonction d'enregistrement d'un utilisateur
const register = async (req, res) => {
  console.log('⛑ [REGISTER] req.body =', req.body);
  try {
    const { username, email, password, confirmPassword, role } = req.body;

    // Vérification des champs requis
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Utilisateur déjà existant' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'Utilisateur'
    });

    return res.status(201).json({ message: 'Utilisateur créé', user: newUser });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

//login 

const login = async ( req, res ) => {
try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
   throw new Error ("Mot de passe incorrect.");
  }
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({
  message: "Connexion réussie",
  token,
  user: {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  }
});
} catch (error) { 
    console.error('[LOGIN ERROR]', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
}
};


// Export des fonctions
module.exports = {
  register,
  login,
};
