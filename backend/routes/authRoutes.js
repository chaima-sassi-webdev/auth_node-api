const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

//  Authentification
router.post('/register', authController.register);
router.post('/login', authController.login);

//  Gestion des utilisateurs
router.get('/users', authController.getAllUsers);
router.delete('/user/:id', authController.deleteUser);
router.put('/user/:id/role', authController.updateUserRole);

//  Vérification du superadmin (utile pour le frontend au démarrage)
router.get('/check-superadmin', authController.checkSuperadmin);
router.post('/verifyEmail', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);
//router.post('/forgot-password', authController.forgotPassword);


module.exports = router;
