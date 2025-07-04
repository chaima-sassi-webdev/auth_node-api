const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // adapte le chemin si nécessaire
const db = require('./config/db'); // ta config Sequelize
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

// 🧠 Middleware pour parser le JSON
app.use(cors());
app.use(express.json());

// Créer un flux d’écriture vers le fichier backend.log
const logFile = fs.createWriteStream(path.join(__dirname, '../var/log/backend.log'), { flags: 'a' });

// Conserver les anciennes fonctions console.log et console.error
const originalLog = console.log;
const originalError = console.error;

// Rediriger console.log et console.error vers le fichier ET la console
console.log = function(message) {
  logFile.write(`[LOG] ${new Date().toISOString()} - ${message}\n`);
  originalLog(message);
};

console.error = function(message) {
  logFile.write(`[ERROR] ${new Date().toISOString()} - ${message}\n`);
  originalError(message);
};

// 🔒 Middleware CORS pour autoriser les requêtes depuis le frontend
app.use(cors({
  origin: '*', // autorise uniquement le frontend React
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// 📦 Routes d'authentification
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error('Erreur attrapée par middleware global :', err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

require('dotenv').config();

// 🚀 Connexion à la base de données et démarrage du serveur
db.authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données réussie.');
    return db.sync();
  })
  .then(() => {
    console.log('✅ Tables synchronisées');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur lors de la connexion/synchronisation :', err.message);
    console.error(err.stack);
    process.exit(1);
  });
