#Etape 1: image Node.js officielle
FROM node:20-alpine

#Créer le répertoire de travail
WORKDIR /app

#Copier les fichiers package.json et installer les dépendances 
COPY package*.json ./
RUN npm install
RUN npm install --omit=dev

#Copier le reste de l'application
COPY . .

#Lancer le serveur
CMD ["npm", "start"]

#Exposer le port utilisé par ton backend
EXPOSE 4000
