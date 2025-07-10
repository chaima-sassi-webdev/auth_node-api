const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const client = require('prom-client');
require('dotenv').config();

const prometheusRegister = client.register;

// 📈 Compteurs Prometheus
const registerCounter = new client.Counter({
  name: 'app_user_register_total',
  help: 'Nombre total de tentatives d’enregistrement',
});

const loginCounter = new client.Counter({
  name: 'app_user_login_total',
  help: 'Nombre total de connexions utilisateur',
});

const userCRUDCounter = new client.Counter({
  name: 'app_user_crud_operations_total',
  help: 'Nombre total d’opérations CRUD sur les utilisateurs',
  labelNames: ['operation'],
});

// 🔐 Enregistrement
const register = async (req, res) => {
  console.log('⛑ [REGISTER] req.body =', req.body);
  const { username, email, password, confirmPassword, role } = req.body;

  try {
    const superadminExists = await User.findOne({ where: { role: 'superadmin' } });

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format d’e-mail invalide.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Un utilisateur avec cet e-mail existe déjà.' });
    }

    let roleToAssign = 'user';
    if (role === 'superadmin') {
      if (superadminExists) {
        return res.status(403).json({ message: "Un superadmin existe déjà." });
      }
      roleToAssign = 'superadmin';
    } else if (['admin', 'user'].includes(role)) {
      roleToAssign = role;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: roleToAssign,
    });

    registerCounter.inc();
    console.log('✅ Utilisateur créé :', newUser.email);

    return res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer plus tard.' });
  }
};

// 🔐 Connexion
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    loginCounter.inc();

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer plus tard.' });
  }
};

// 🔍 Vérification de l’email
const verifyEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "L'email est requis." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Adresse e-mail introuvable." });
    }

    return res.status(200).json({ message: "Email vérifié, vous pouvez saisir un nouveau mot de passe." });
  } catch (error) {
    console.error('[VERIFY EMAIL ERROR]', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🔄 Réinitialisation du mot de passe
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "L'email est requis." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: "Email non trouvé." });
    }

    // Simule l'envoi d'un lien de réinitialisation
    return res.status(200).json({ message: "Lien de réinitialisation envoyé (simulé)." });

  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🔐 Vérification de la complexité du mot de passe
const verifierMotDePasse = (password) => {
  const erreurs = [];
  if (password.length < 8) erreurs.push("Trop court (min. 8 caractères)");
  if (!/[a-z]/.test(password)) erreurs.push("Doit contenir une minuscule");
  if (!/[A-Z]/.test(password)) erreurs.push("Doit contenir une majuscule");
  if (!/\d/.test(password)) erreurs.push("Doit contenir un chiffre");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) erreurs.push("Doit contenir un caractère spécial");
  return erreurs;
};

// 🔑 Réinitialisation réelle
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const erreurs = verifierMotDePasse(newPassword);
  if (erreurs.length > 0) {
    return res.status(400).json({ message: "Mot de passe invalide.", erreurs });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Mot de passe mis à jour." });
  } catch (error) {
    console.error('[RESET PASSWORD ERROR]', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 📋 Lire tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role'],
    });
    userCRUDCounter.inc({ operation: 'read' });
    res.json(users);
  } catch (error) {
    console.error('[GET USERS ERROR]', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ❌ Supprimer un utilisateur
const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Seul un admin peut supprimer un utilisateur.' });
  }

  try {
    const deleted = await User.destroy({ where: { id } });
    if (deleted) {
      userCRUDCounter.inc({ operation: 'delete' });
      res.status(200).json({ message: 'Utilisateur supprimé.' });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
  } catch (error) {
    console.error('[DELETE USER ERROR]', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🔄 Changer le rôle d’un utilisateur
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { currentUserRole, newRole } = req.body;

  if (currentUserRole !== 'admin') {
    return res.status(403).json({ message: 'Seul un admin peut changer les rôles.' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    user.role = newRole;
    await user.save();
    userCRUDCounter.inc({ operation: 'update' });

    res.status(200).json({ message: 'Rôle mis à jour.' });
  } catch (error) {
    console.error('[UPDATE ROLE ERROR]', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🔍 Vérifie s’il existe un superadmin
const checkSuperadmin = async (req, res) => {
  try {
    const superadmin = await User.findOne({ where: { role: 'superadmin' } });
    res.status(200).json({ exists: !!superadmin });
  } catch (error) {
    console.error('[CHECK SUPERADMIN ERROR]', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🚪 Déconnexion (statique)
const logout = (req, res) => {
  res.status(200).json({ message: "Déconnexion réussie." });
};

// 📦 Export
module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getAllUsers,
  deleteUser,
  updateUserRole,
  checkSuperadmin,
  prometheusRegister,
  logout,
};
