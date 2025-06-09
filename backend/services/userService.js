const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async ({ username, email, password, confirmPassword, role }) => 
  if (password !== confirmPassword) {
    throw new Error("Les mots de passe ne correspondent pas.");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('Email déjà utilisé');
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ username, email, password: hashedPassword, role });
  return user.save();
  return user;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Utilisateur non trouvé');
  
  const match = await user.comparePassword(password);
  if(!match) throw new Error('Mot de passe incorrect');
  const token = jwt.sign({ id: user._id, role: user.role }, 'SECRET', { expiresIn: '1h' });
  return token;
};

module.exports = { register, login }
