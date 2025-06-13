const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

// 🔐 Enregistrement d'un nouvel utilisateur
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
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Un utilisateur avec cet e-mail existe déjà.' });
    }

    // Attribution du rôle
    let roleToAssign = 'user';
    if (!superadminExists && role === 'superadmin') {
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

// 🔍 Vérifier si un email existe (pour réinitialisation)
const verifyEmail = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    if (!email) {
      return res.status(400).json({ message: "L'email est requis." });
    }

    const user = await User.findOne({ where: { email } });
   console.log(user);
    if (!user) {
      return res.status(404).json({ message: "Adresse e-mail introuvable." });
    }

    return res.status(200).json({ message: "Email vérifié, vous pouvez saisir un nouveau mot de passe." });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// 🔄 Réinitialiser le mot de passe
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

    // Ici, dans une vraie app, envoie un email avec un token de reset
    // Pour simplifier, on répond juste que le mail a été envoyé
    return res.status(200).json({ message: "Lien de réinitialisation envoyé (simulé)." });
  } catch (error) {
    console.error("[FORGOT PASSWORD ERROR]", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// 🔑 Changer le mot de passe (après vérification email)
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email et nouveau mot de passe requis." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    console.error("[RESET PASSWORD ERROR]", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// 📋 Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role'], // éviter de renvoyer les mots de passe
    });
    res.json(users);
  } catch (error) {
    console.error("[GET USERS ERROR]", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des utilisateurs." });
  }
};

// ❌ Supprimer un utilisateur (admin uniquement)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== "admin") {
    return res.status(403).json({ message: "Accès refusé. Seul un administrateur peut supprimer un utilisateur." });
  }

  try {
    const deleted = await User.destroy({ where: { id } });
    if (deleted) {
      res.status(200).json({ message: "Utilisateur supprimé avec succès." });
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé." });
    }
  } catch (error) {
    console.error("[DELETE USER ERROR]", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 🔄 Modifier le rôle d'un utilisateur (admin uniquement)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { currentUserRole, newRole } = req.body;

  if (currentUserRole !== "admin") {
    return res.status(403).json({ message: "Accès refusé. Seul un administrateur peut modifier les rôles." });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    user.role = newRole;
    await user.save();

    res.status(200).json({ message: "Rôle mis à jour avec succès." });
  } catch (error) {
    console.error("[UPDATE ROLE ERROR]", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 🕵️ Vérification de l'existence d'un superadmin (utilisé côté frontend)
const checkSuperadmin = async (req, res) => {
  try {
    const superadmin = await User.findOne({ where: { role: 'superadmin' } });
    res.status(200).json({ exists: !!superadmin });
  } catch (error) {
    console.error('[CHECK SUPERADMIN ERROR]', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

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
};
