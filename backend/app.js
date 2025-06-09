const express = require('express');
const authRoutes = require('./routes/authRoutes'); // adapte le chemin si nécessaire
const db = require('./config/db'); // ou selon ta config Sequelize

const app = express();
const PORT = process.env.PORT || 4000;

// 🧠 Middleware pour parser JSON
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);

// Démarrage serveur + DB
db.authenticate()
  .then(() => {
    console.log('Connexion à la base de données réussie.');
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erreur de connexion à la base de données :', err);
  });

