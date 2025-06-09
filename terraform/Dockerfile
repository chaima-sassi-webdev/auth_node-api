# Utilise l'image officielle Node.js en version 18
FROM node:18

# Définit le dossier de travail dans le conteneur
WORKDIR /app

# Copie les fichiers package.json et package-lock.json (si existant)
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le reste des fichiers dans le conteneur
COPY . .

# Expose le port 3000
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
