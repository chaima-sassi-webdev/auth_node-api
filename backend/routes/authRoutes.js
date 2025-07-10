const express = require('express'); 
const router = express.Router(); 
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verifyEmail', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);
router.post("/logout", authController.logout);
router.get('/check-superadmin', authController.checkSuperadmin);

// Routes protégées (nécessitent un token valide)
router.get('/users', authMiddleware.verifyToken, authController.getAllUsers);
router.delete('/user/:id', authMiddleware.verifyToken, authController.deleteUser);
router.put('/user/:id/role', authMiddleware.verifyToken, authController.updateUserRole);

module.exports = router;
