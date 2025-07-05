require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbUrl = isProduction ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_LOCAL;

if ( !dbUrl ) {
  throw new Error (' Aucun DATABASE_URL défini dans le fichier .env');
}

const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,  
          },
        }
      : {},
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => {
    console.log(`Connexion à la base de données ${isProduction ? 'cloud (PROD)' : 'locale (DEV)'}` );
  })
  .catch((err) => {
    console.error('Impossible de se connecter à la base de données :', err);
  });

module.exports = sequelize;
