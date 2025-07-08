
const { Sequelize } = require('sequelize');


const isProduction = process.env.NODE_ENV === 'production';
const dbUrl = process.env.DATABASE_URL;

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
    console.log(`Connexion à la base de données cloud (PROD)` );
  })
  .catch((err) => {
    console.error('Impossible de se connecter à la base de données :', err);
  });

module.exports = sequelize;
