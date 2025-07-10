const express = require('express'); 
const router = express.Router(); 
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verifyEmail', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);
router.post("/logout", authController.logout);
router.get('/check-superadmin', authController.checkSuperadmin);

// Routes protégées (nécessitent un token valide)
router.get('/users', authMiddleware.verifyToken, authController.getAllUsers);
router.delete('/user/:id', verifyToken, async (req, res) => {
  // On vérifie le rôle de l’utilisateur issu du token
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Seul un admin peut supprimer un utilisateur.' });
  }
  await authController.deleteUser(req, res);
});
router.put('/user/:id/role', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Seul un admin peut changer les rôles.' });
  }
  await authController.updateUserRole(req, res);
});

module.exports = router;
