const envPath = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
require('dotenv').config({ path: envPath });

const { Sequelize } = require('sequelize');

// Vérifie si on est en production
const isProduction = process.env.NODE_ENV === 'production' ? '.env' : 'env.local';

// Choix de l'URL de connexion selon l'environnement
const dbUrl = isProduction
  ? process.env.DATABASE_URL_PROD || process.env.DATABASE_URL
  : process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('❌ Aucun DATABASE_URL défini dans le fichier .env');
}

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Connexion Sequelize
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false, // utile pour Railway
        },
      }
    : {},
  logging: false, // désactive les logs SQL dans la console
});

// Test de la connexion
sequelize
  .authenticate()
  .then(() => {
   // console.log(`✅ Connexion à la base de données ${isProduction ? 'cloud (PROD)' : 'locale (DEV)'}`);
 console.log(`✅ Connexion à la base de données ${dbUrl}`);
  })
  .catch((err) => {
    console.error('❌ Impossible de se connecter à la base de données :', err.message);
    process.exit(1);
  });

module.exports = sequelize;
