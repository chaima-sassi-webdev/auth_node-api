require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const fs = require('fs');
const path = require('path');
const client = require('prom-client');
const sequelize = require('./config/db'); // c'est ton instance Sequelize
const User = require('./models/userModel'); // s'assurer que le modèle est chargé

const app = express();
const PORT = process.env.PORT || 4000;

// Initialisation des métriques Prometheus
client.collectDefaultMetrics();

// Middleware pour parser le JSON
app.use(express.json());

// Middleware CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Logging vers fichier et console
const logFile = fs.createWriteStream(path.join(__dirname, '../var/log/backend.log'), { flags: 'a' });
const originalLog = console.log;
const originalError = console.error;

console.log = function (message) {
  logFile.write(`[LOG] ${new Date().toISOString()} - ${message}\n`);
  originalLog(message);
};

console.error = function (message) {
  logFile.write(`[ERROR] ${new Date().toISOString()} - ${message}\n`);
  originalError(message);
};

// Routes
app.get('/', (req, res) => {
  console.log('Route racine appelée');
  res.send('API backend is running');
});

app.use('/api/auth', authRoutes);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Middleware global d'erreur
app.use((err, req, res, next) => {
  console.error('Erreur attrapée par middleware global :', err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// Connexion et synchronisation de la base de données
sequelize.authenticate()
  .then(() => {
    console.log(`✅ Connexion à la base de données ${process.env.DATABASE_URL || ''}`);
    return sequelize.sync({ alter: true }); // ✅ on conserve les données, met à jour les tables si besoin
  })
  .then(() => {
    console.log('✅ Tables synchronisées avec succès');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur lors de la connexion ou de la synchronisation :', err.message);
    console.error(err.stack);
    process.exit(1);
  });
